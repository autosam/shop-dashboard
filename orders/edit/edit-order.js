let SET_ID;

function getOrders(){
    return new Promise((resolve, reject) => {
        fetch(`https://api.omegarelectrice.com/orderList.php?set_id=${SET_ID}`)
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

    console.log(orders);

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

        // <td id="product-name">${name}</td>

        let productDD = productsHelper.listToDropdown(order.product);

        let orderTypeDD = `
            <select class="form-control">
                <option ${order.type=='box' ? "selected" : ""} value="box">جعبه ای</option>
                <option ${order.type=='single' ? "selected" : ""} value="single">تکی</option>
            </select>
        `;

        let orderQuantityInp = `
            <input class="form-control" value="${order.quantity}"></input>
        `
        
        tbody.innerHTML += `
        <tr data-order-id="${order.order_id}" data-set-id="${order.setId}">
            <td id="hash-num"><div class="set-order-invisible">${i+1}</div></td>
            <td id="product-name">${productDD.outerHTML}</td>
            <td id="quantity" style="text-align: center;">${orderQuantityInp}</td>
            <td id="type" style="text-align: center;">${orderTypeDD}</td>
            <td id="actions" style="text-align: center;">
                <div class="actions-container">
                    <i class="order-delete fa-solid fa-trash btn btn-danger"></i>
                </div>
            </td>
        </tr>
        `;

    });

    [...document.querySelectorAll('.order-delete')].forEach(btn => {
        btn.onclick = function(){
            if(!confirm("این آیتم از سفارش حذف خواهد شد، آیا از انجام این کار اطمینان دارید؟ (عملیات غیر قابل بازگشت است)")) return;

            let orderId = this.closest('tr').dataset.orderId;

            fetch(`https://api.omegarelectrice.com/orderDelete.php?order_id=${orderId}`)
            .then(response => response.json())
            .then(json => {
                if(i == orders.length - 1){
                    toast('success', 'محصول حذف شد');
                    refreshOrders();
                }
            })
            .catch(e => {
                toast('error', 'مشکلی پیش آمده');
            });
        }
    })

    document.querySelector('.orders-container').setAttribute('data-loading', false);
}

function save(){
    let orders = [...document.querySelectorAll('.orders-table tbody tr')];

    orders.forEach((tr, i) => {
        let product = tr.querySelector('#product-name > .form-control').value;
        let quantity = tr.querySelector('#quantity > .form-control').value;
        let type = tr.querySelector('#type > .form-control').value;

        fetch(`https://api.omegarelectrice.com/orderInfo.php?order_id=${tr.dataset.orderId}&product=${product}&quantity=${quantity}&type=${type}`)
        .then(response => response.json())
        .then(json => {
            if(i == orders.length - 1){
                toast('success', 'با موفقیت ثبت شد');
                refreshOrders();
            }
        })
        .catch(e => {
            toast('error', 'مشکلی پیش آمده');
        });
    })
}

async function init(){
    await productsHelper.init();

    let params = getJsonFromUrl();
    SET_ID = params.setId;

    if(!SET_ID) {
        document.body.style.display = 'none';
        return;
    }

    document.querySelector('.page-title h1').textContent += ` ${SET_ID}`;

    refreshOrders();

    document.querySelector('.btn.save').onclick = save;
}

init();