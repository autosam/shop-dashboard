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
    orders.forEach((order, i) => {
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

        let processed = '<span class="badge bg-primary"> در حال بررسی </span>';
        if(order.processed == 1) processed = '<span class="badge bg-success"> تایید شده </span>';
        else if(order.processed == -1) processed = '<span class="badge bg-danger"> رد شده </span>';
        tbody.innerHTML += `
        <tr data-order-id="${order.order_id}">
            <td>${i+1}</td>
            <td>${order.timestamp}</td>
            <td>${order.user}</td>
            <td>${name}</td>
            <td style="text-align: center;">${order.quantity}</td>
            <td style="text-align: center;">${order.type == 'single' ? "تکی" : "جعبه ای"}</td>
            <td style="text-align: center;">${processed}</td>
            <td style="text-align: center;">
                <i class="order-accept fa-solid fa-check btn btn-success"></i>
                <i class="order-reject fa-solid fa-times btn btn-danger"></i>
            </td>
        </tr>
        `;
    });

    Array.from(tbody.querySelectorAll('tr')).forEach(row => {
        let orderId = row.getAttribute('data-order-id');
        row.querySelector('.order-accept').onclick = function(){
            setOrderState(orderId, 1);
        }
        row.querySelector('.order-reject').onclick = function(){
            setOrderState(orderId, -1);
        }
    });

    document.querySelector('.orders-container').setAttribute('data-loading', false);
}

function setOrderState(orderId, state){
    fetch(`https://api.omegarelectrice.com/orderState.php?order_id=${orderId}&state=${state}`)
    .then(response => response.json)
    .then(json => {
        refreshOrders();
        toast('success', 'عملیات با موفقیت انجام شد');
    }).catch(e => {
        toast('error', e);
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