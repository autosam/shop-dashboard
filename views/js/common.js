const API_ROUTE = 'https://api.omegarelectrice.com/';

$(function () {
    // sticky
    const observer = new IntersectionObserver(function ([e]) {
        e.target.classList.toggle('stick-transparent-bg', e.intersectionRatio < 1);
    }, {
        rootMargin: '-75px 0px 0px 0px',
        threshold: [1],
    });
    Array.from(document.querySelectorAll('.stick-transparent-bg')).forEach(sticky => {
        observer.observe(sticky);
    });

    // page load
    // document.body.removeAttribute('style');
    document.body.style.display = '';

    // footer
    loadEx('/views/html/footer.html', {
        position: 'end',
    });
});

function loadEx(path, config) {
    let placeholder = document.createElement('inc');

    document.body.appendChild(placeholder);

    // $(placeholder).load(path);
    $.get(path, function (data) {
        $(placeholder).replaceWith(data);
    });
}

let toast = function (type, title, msg) {
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "0",
        "hideDuration": "1000",
        "timeOut": "2000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut",
        "rtl": true
    }
    toastr[type](title, msg);
}

let productsHelper = {
    list: null,
    initialied: false,
    async init() {
        return new Promise(async (resolve, reject) => {
            await this.getOrderStates();
            this.loadProducts().then(() => {
                productsHelper.initialied = true;
                resolve(productsHelper.list);
            });
        })
    },
    loadProducts: function () {
        return new Promise((resolve, reject) => {
            fetch("https://api.omegarelectrice.com/json/products.json").then(response => response.json()).then(list => {
                resolve(list);
                productsHelper.list = list;
            });
        });
    },
    getProductById: function (id) {
        for (let i = 0; i < this.list.length; i++) {
            let product = this.list[i];
            if (product.id == id) {
                return product;
            }
        }
        return false;
    },
    tagIdToText: function (id) {
        switch (id) {
            case "meter": return "متراژ";
            case "amper": return "آمپر";
            case "watt": return "وات";
            case "box_amount": return "تعداد در کارتن";
            case "custom": return "تگ";
            default: return 'تگ';
        }
    },
    transState: function (code) {
        function getStateDescription() {
            let state = productsHelper.orderStates[code];
            if (!state) {
                return 'نامشخص';
            }
            return state.description;
        }

        function getBadgeClass() {
            switch (code.toString()) {
                case '0':
                    return 'badge bg-primary';
                case '-1':
                    return 'badge bg-danger';
                case '1':
                    return 'badge bg-success';
                default:
                    return 'badge bg-secondary';
            }
        }

        let description = getStateDescription();

        return {
            description,
            badge: `<span id="state" class="${getBadgeClass()}"> ${description} </span>`,
        }
    },
    getOrderStates: function(){
        return fetch("https://cdn.omegarelectrice.com/metadata/order-states.json")
        .then(res => res.json())
        .then(json => {
            let states = {};
            json.forEach(entry => {
                states[entry.code] = {description: entry.description, ident: entry.state};
            });
            productsHelper.orderStates = states;
            productsHelper.orderStatesRaw = json;
            productsHelper.orderSelect = `
                <select class="form-control" id="order-state">
                    <option value="null" disabled selected> وضعیت را انتخاب کنید </option>
                    ${
                        productsHelper.orderStatesRaw.map(state => {
                            return `<option value="${state.code}"> ${state.description} </option>`
                        })
                    }
                </select>
            `
        })
        .catch(e => {
            console.log(e);
            productsHelper.orderStates = -1;
        });
    },
    listToDropdown: function(selectId){
        let dd = document.createElement('select');
            dd.classList.add('form-control');
        this.list.forEach(product => {
            let fullTitle = product.title;
            for(let key in product.tags){
                fullTitle += ` - ${productsHelper.tagIdToText(key)}: ${product.tags[key]}`;
            }
            $(`
                <option ${product.id == selectId ? "selected" : ""} value="${product.id}">${fullTitle}</option>
            `).appendTo(dd);
        });
        return dd;
    },
}

let utils = {
    randomInt: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    randomCharacters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789'.split(''),
    generateRandomChars: function(length, randomCharacters){
        if(!randomCharacters) randomCharacters = this.randomCharacters;
        if(!length) length = 20;
        let str = '';
        for(let i = 0; i < length; i++)
            str += randomCharacters[utils.randomInt(0, randomCharacters.length - 1)];
        return str;
    },
    persianNum: function(text){
        return persianJs(new Intl.NumberFormat('en-US', {style : "decimal" }).format(text)).englishNumber()
    },
    convertNumFaToEn: function(text){
        return text
            .toString()
            .replaceAll('1', '۱')
            .replaceAll('2', '۲')
            .replaceAll('3', '۳')
            .replaceAll('4', '۴')
            .replaceAll('5', '۵')
            .replaceAll('6', '۶')
            .replaceAll('7', '۷')
            .replaceAll('8', '۸')
            .replaceAll('9', '۹')
            .replaceAll('0', '۰');
    },
    convertNumEnToFa: function(text){
        return text
            .toString()
            .replaceAll('۱', '1')
            .replaceAll('۲', '2')
            .replaceAll('۳', '3')
            .replaceAll('۴', '4')
            .replaceAll('۵', '5')
            .replaceAll('۶', '6')
            .replaceAll('۷', '7')
            .replaceAll('۸', '8')
            .replaceAll('۹', '9')
            .replaceAll('۰', '0');
    },
    setCookie: function(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },
    getCookie: function(cname) {
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
            c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
            }
        }
        return "";
    },
}

function getJsonFromUrl(url) {
    if (!url) url = location.search;
    var query = url.substr(1);
    var result = {};
    query.split("&").forEach(function (part) {
        var item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}