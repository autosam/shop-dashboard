function addOrder(){
    let n = document.querySelector('.cloneables .new-order').cloneNode(true);
    document.querySelector('.orders-container').appendChild(n);
    
    n.querySelector('.btn.remove').onclick = function(){
        this.closest('.new-order').remove();
    }
}

function submit(){
    let user = document.querySelector('.user').value;
    if(!user){
        toast('error', 'نام مشتری وارد نشده');
        return;
    }

    let allOrders = [...document.querySelectorAll('.orders-container .new-order')];
    if(!allOrders.length){
        toast('error', 'هیج محصولی ثبت نشده');
        return;
    }


    if(!confirm('آیا میخواهید سفارش ثبت شود؟')) return;


    let setId = utils.generateRandomChars(8);
    allOrders.forEach((order, i) => {
        let productId = order.querySelector('.product .form-control').value;
        let type = order.querySelector('.type').value;
        let quantity = order.querySelector('.quantity').value;

        
        $.ajax({
            url: 'https://api.omegarelectrice.com/order.php',
            type: 'POST',
            data: JSON.stringify({
                user,
                product: productId,
                quantity,
                type,
                setId
            }),
            dataType: "json", 
            success: function(response) {
                console.log(response);
                if(i == allOrders.length - 1){
                    toast('success', 'عملیات با موفقیت انجام شد');
                    setTimeout(() => {
                        document.querySelector(".loading-overlay").style.opacity = 100; 
                        window.location.href = `/orders/edit?setId=${setId}`;
                    }, 2000);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // Handle the error response here
                console.log("Error: " + textStatus + " - " + errorThrown);
                console.log("Status: " + jqXHR.status + " - " + jqXHR.statusText);
                console.log("Content: " + jqXHR.responseText);
                toast('error', "مشکلی پیش آمده " + errorThrown);
            },
        });
    });
}

let UNIQUE_USERS;
function getUniqueUsers(){
    return fetch('https://api.omegarelectrice.com/uniqueUsers.php')
    .then(response => response.json())
    .then(json => {
        UNIQUE_USERS = json;
    })
}

async function init(){
    await productsHelper.init();

    await getUniqueUsers();

    let usersDataList = `
        <datalist id="users">
            ${
                UNIQUE_USERS.reverse().map(user => {
                    return ` <option>${user.user}</option>`;
                })
            }
        </datalist>
    `;
    document.body.innerHTML = usersDataList + document.body.innerHTML;


    let productDD = productsHelper.listToDropdown();
    document.querySelector('.cloneables .new-order .product').appendChild(productDD);

    document.querySelector('.btn.submit').onclick = submit;
    document.querySelector('.btn.add').onclick = addOrder;
}

init();