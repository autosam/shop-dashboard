function getOrders(){
    return new Promise((resolve, reject) => {
        fetch('https://api.omegarelectrice.com/orderList.php')
        .then(response => response.json())
        .then(res => {
            resolve(res);
            // console.log(res);
        })
        .catch(e => {
            reject(e);
        })
    })
}

async function saveFile(fileData, defaultName){
    var picker = await showSaveFilePicker({
        suggestedName: defaultName,
        types: [{
            accept: {'text/plain': ['.csv']}
        }],
    });

    var blob = new Blob([fileData]);
    var pickerWritable = await picker.createWritable();
    await pickerWritable.write(blob);
    await pickerWritable.close();
}

async function refreshOrders(){
    let tbody = document.querySelector('.orders-table tbody');
    document.querySelector('.orders-container').setAttribute('data-loading', true);
    let orders = await getOrders();
    tbody.innerHTML = '';
    let lastSetId = false;
    let i = -1;
    let rowClass = 0;
    orders.forEach((order, _i) => {
        i++;
        let name;
        let product = productsHelper.getProductById(order.product);
        if(product){
            name = `${product.title}`;
            
            for(let key in product.tags){
                name += ` <div class="badge bg-secondary">${productsHelper.tagIdToText(key)}: ${product.tags[key]}</div> `;
            }
        } else {
            name = order.product;
        }

        let isPartOfSet = false;
        if(lastSetId && lastSetId == order.setId){
            isPartOfSet = true;
            i--;
        } else {
            rowClass = (rowClass + 1) % 2;
        }
        lastSetId = order.setId;

        // let processed = '<span class="badge bg-primary"> در حال بررسی </span>';
        // if(order.processed == 1) processed = '<span class="badge bg-success"> تایید شده </span>';
        // else if(order.processed == -1) processed = '<span class="badge bg-danger"> رد شده </span>';
        let processed = productsHelper.transState(order.processed).badge;
        
        tbody.innerHTML += `
        <tr data-order-id="${order.order_id}" data-set-id="${order.setId}" class="${isPartOfSet ? "set-order" : ""} o-row-${rowClass}">
            <td id="hash-num"><div class="set-order-invisible">${i+1}</div></td>
            <td id="timestamp"><div class="set-order-invisible">${new Date(order.timestamp).toLocaleDateString('fa-IR')} - ${new Date(order.timestamp).toLocaleTimeString('fa-IR')}</div></td>
            <td id="user"><div class="set-order-invisible">${order.user}</div></td>
            <td id="product-name">${name}</td>
            <td id="quantity" style="text-align: center;">${order.quantity}</td>
            <td id="type" style="text-align: center;">${order.type == 'single' ? "تکی" : "جعبه ای"}</td>
            <td id="state" style="text-align: center;"><span>${processed}</span></td>
            <td id="actions" style="text-align: center;">
                <div class="set-order-invisiblee actions-container">
                    <i class="order-set-state fa-solid fa-angle-right btn btn-primary"></i>
                    ${ORDER_SELECT}
                    

                    <i class="order-export fa-solid fa-file-excel btn btn-success"></i>
                    <a href="/orders/edit?setId=${order.setId}" target="_blank">
                        <i style="height: 100%" class="order-edit fa-solid fa-pen btn btn-secondary"></i>
                    </a>
                </div>
            </td>
        </tr>
        `;
    });

    let fnAction = function(setId, state){
        if(setId){
            let list = [...document.querySelectorAll(`tr[data-set-id="${setId}"]`)];
            list.forEach((row, i) => {
                let orderId = row.getAttribute('data-order-id');
                setOrderState(orderId, state, i != 0, i != list.length - 1);
            });
            return;
        } else {
            toast('error', 'مشکلی به وجود آمده' + 'NoSetId');
        }
    }

    Array.from(tbody.querySelectorAll('tr')).forEach(row => {
        let orderId = row.getAttribute('data-order-id'),
            setId = row.getAttribute('data-set-id');
        row.querySelector('.order-set-state').onclick = function(){
            let select = row.querySelector('#order-state');
            if(select.value == "null") {
                select.style.borderColor = 'red'; 
                return;
            }
            fnAction(setId, select.value);
        }
        // row.querySelector('.order-accept').onclick = function(){
        //     fnAction(setId, 1);
        // }
        // row.querySelector('.order-reject').onclick = function(){
        //     fnAction(setId, -1);
        // }
        row.querySelector('.order-export').onclick = function(){
            let list = [];
            [...document.querySelectorAll(`tr[data-set-id="${setId}"]`)].forEach((row, i) => {
                let orderId = row.getAttribute('data-order-id');

                let item = [];

                item.push(row.querySelector('#timestamp').textContent);
                item.push(row.querySelector('#user').textContent)
                item.push(row.querySelector('#product-name').textContent)
                item.push(row.querySelector('#quantity').textContent)
                item.push(row.querySelector('#type').textContent)
                item.push(orderId)
                item.push(setId)

                list.push(item);
            });
            let csv = Papa.unparse(list, {header: ['timestamp', 'user', 'product', 'quantity', 'type', 'orderid', 'setid']});
            // console.log({csv, list});
            console.log(csv);
            saveFile(csv, 'order-' + setId + '.csv');
        }
    });

    document.querySelector('.orders-container').setAttribute('data-loading', false);
}

function setOrderState(orderId, state, nonVerbose, noRefresh){
    fetch(`https://api.omegarelectrice.com/orderState.php?order_id=${orderId}&state=${state}`)
    .then(response => response.json)
    .then(json => {
        if(!noRefresh) refreshOrders();
        if(!nonVerbose) toast('success', 'عملیات با موفقیت انجام شد');
    }).catch(e => {
        if(!nonVerbose) toast('error', e);
        if(!noRefresh) refreshOrders();
    });
}

let ORDER_STATES = null, ORDER_STATES_RAW = null, ORDER_SELECT;
function getOrderStates(){
    return fetch("https://cdn.omegarelectrice.com/metadata/order-states.json")
        .then(res => res.json())
        .then(json => {
            let states = {};
            json.forEach(entry => {
                states[entry.code] = {description: entry.description, ident: entry.state};
            });
            ORDER_STATES = states;
            ORDER_STATES_RAW = json;
            ORDER_SELECT = `
                <select class="form-control" id="order-state">
                    <option value="null" disabled selected> وضعیت را انتخاب کنید </option>
                    ${
                        ORDER_STATES_RAW.map(state => {
                            return `<option value="${state.code}"> ${state.description} </option>`
                        })
                    }
                </select>
            `
        })
        .catch(e => {
            console.log(e);
            ORDER_STATES = -1;
        });
}

async function init(){
    await getOrderStates();

    await productsHelper.init();

    let refreshBtn = document.querySelector('.btn.refresh');
    refreshBtn.onclick = function(){
        refreshOrders();
        this.querySelector('i').classList.add('fa-spin');
        setTimeout(() => this.querySelector('i').classList.remove('fa-spin'), 1000)
    };

    // setInterval(() => {
    //     refreshBtn.click();
    // }, 20000);

    refreshBtn.click();
}

init();