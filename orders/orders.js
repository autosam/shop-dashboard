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
        }
        lastSetId = order.setId;

        let processed = '<span class="badge bg-primary"> در حال بررسی </span>';
        if(order.processed == 1) processed = '<span class="badge bg-success"> تایید شده </span>';
        else if(order.processed == -1) processed = '<span class="badge bg-danger"> رد شده </span>';
        tbody.innerHTML += `
        <tr data-order-id="${order.order_id}" data-set-id="${order.setId}" class="${isPartOfSet ? "set-order" : ""}">
            <td id="hash-num"><div class="set-order-invisible">${i+1}</div></td>
            <td id="timestamp"><div class="set-order-invisible">${order.timestamp}</div></td>
            <td id="user"><div class="set-order-invisible">${order.user}</div></td>
            <td id="product-name">${name}</td>
            <td id="quantity" style="text-align: center;">${order.quantity}</td>
            <td id="type" style="text-align: center;">${order.type == 'single' ? "تکی" : "جعبه ای"}</td>
            <td id="state" style="text-align: center;"><span>${processed}</span></td>
            <td id="actions" style="text-align: center;">
                <div class="set-order-invisiblee">
                    <i class="order-accept fa-solid fa-check btn btn-success"></i>
                    <i class="order-reject fa-solid fa-times btn btn-danger"></i>
                    <i class="order-export fa-solid fa-file-excel btn btn-secondary"></i>
                </div>
            </td>
        </tr>
        `;
    });

    let fnAction = function(setId, state){
        if(setId){
            [...document.querySelectorAll(`tr[data-set-id="${setId}"]`)].forEach((row, i) => {
                let orderId = row.getAttribute('data-order-id');
                setOrderState(orderId, state, i != 0);
            });
            return;
        } else {
            toast('error', 'مشکلی به وجود آمده' + 'NoSetId');
        }
    }

    Array.from(tbody.querySelectorAll('tr')).forEach(row => {
        let orderId = row.getAttribute('data-order-id'),
            setId = row.getAttribute('data-set-id');
        row.querySelector('.order-accept').onclick = function(){
            fnAction(setId, 1);
        }
        row.querySelector('.order-reject').onclick = function(){
            fnAction(setId, -1);
        }
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

function setOrderState(orderId, state, nonVerbose){
    fetch(`https://api.omegarelectrice.com/orderState.php?order_id=${orderId}&state=${state}`)
    .then(response => response.json)
    .then(json => {
        refreshOrders();
        if(!nonVerbose) toast('success', 'عملیات با موفقیت انجام شد');
    }).catch(e => {
        if(!nonVerbose) toast('error', e);
        refreshOrders();
    });
}

async function init(){
    // productsList = await loadProducts();
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

let productsHelper = {
    list: null,
    initialied: false,
    async init(){
        return new Promise((resolve, reject) => {
            this.loadProducts().then(() => {
                productsHelper.initialied = true;
                resolve(productsHelper.list);
            });
        })
    },
    loadProducts: function(){
        return new Promise((resolve, reject) => {
            fetch("https://api.omegarelectrice.com/json/products.json").then(response => response.json()).then(list => {
                resolve(list);
                productsHelper.list = list;
            });
        });
    },
    getProductById: function(id){
        for(let i = 0; i < this.list.length; i++){
            let product = this.list[i];
            if(product.id == id){
                return product;
            }
        }
        return false;
    },
    tagIdToText: function(id){
        switch(id){
            case "meter": return "متراژ";
            case "amper": return "آمپر";
            case "watt": return "وات";
            case "box_amount": return "تعداد در کارتن";
            case "custom": return "تگ";
        }
    }
}

init();