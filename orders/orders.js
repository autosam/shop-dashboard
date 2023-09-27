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
            <td><div>${i+1}</div></td>
            <td><div>${order.timestamp}</div></td>
            <td><div>${order.user}</div></td>
            <td>${name}</td>
            <td style="text-align: center;">${order.quantity}</td>
            <td style="text-align: center;">${order.type == 'single' ? "تکی" : "جعبه ای"}</td>
            <td style="text-align: center;"><span>${processed}</span></td>
            <td style="text-align: center;">
                <div>
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

    setInterval(() => {
        // refreshBtn.click();
    }, 20000);

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