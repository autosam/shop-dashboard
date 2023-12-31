let main = {
    validTags: ['box_amount', 'meter', 'amper'],
    dom: {
        productList: document.querySelector('.product-list'),
        cloneableProduct: document.querySelector('.product.cloneable'),
    },
    init: function(){
        // this.addProductDom({

        // });
        this.loadProductList(`https://api.omegarelectrice.com/json/products.json?tmp=${new Date().getTime()}`);
        main.sortable = Sortable.create(this.dom.productList, {
            // animation: 150,
            // easing: "cubic-bezier(1, 0, 0, 1)",
            // handle: '.sortable-handle',
            // ghostClass: "sortable-ghost",

            animation: 100,
            draggable: '.product',
            handle: '.sortable-handle',
            sort: true,
            filter: '.sortable-disabled',
            ghostClass: 'sortable-active',
            forceFallback: true,
        });
    },
    async loadProductList(path){
        let list;
        
        this.clearProductList();

        try {
            let response = await fetch(path);
            list = await response.json();
        } catch(e) {
            alert("مشکل در بارگذاری لیست محصولات، در حال بارگذاری مجدد...");
            location.reload();
            return;
        }

        this.clearProductList();

        this.list = list;

        list.forEach(productDefinition => {
            // main.dom.productList.innerHTML += `\n${JSON.stringify(productDefinition)}`;
            main.addProductDom(productDefinition);
        });
    },
    clearProductList: function(){
        main.dom.productList.innerHTML = '';
    },
    addProductDom: function(def){
        let product = this.dom.cloneableProduct.cloneNode(true);
            product.classList.remove('cloneable');
        
        if(def){
            product.querySelector('.product-title').value = def.title || '';
            product.querySelector('.product-description').value = def.description || '';
            product.querySelector('.product-price').value = def.price || '';
            if(def.price == -1){
                product.classList.add('disabled');
            }
            product.querySelector('.product-image').value = def.image || '';
            let imagePreview = product.querySelector('.product-image-preview');
            if(def.image) imagePreview.src = 'https://autosam.github.io/shop/' + def.image;
            product.querySelector('.product-image').onchange = function(){
                imagePreview.src = 'https://autosam.github.io/shop/' + this.value;
            }
            product.querySelector('.product-category').value = def.category || '';
            // product.querySelector('.product-tags').value = JSON.stringify(def.tags, null, 1) || '';
            product.setAttribute('data-tags', JSON.stringify(def.tags) || "{}");
            if(def.id){
                product.setAttribute('data-product-id', def.id);
            } else {
                product.setAttribute('data-product-id', Math.round(Math.random() * 951847321));
            }
            if(def.isNew){
                product.classList.add('new');
            }

            product.querySelector('.product-subcategory').value = def.subCategory || '';
            product.querySelector('#box-sell').checked = def.boxSell;
            product.querySelector('#single-sell').checked = def.singleSell;
            product.querySelector('.product-off-price').value = def.offPrice || '';

            if(def.tags){
                if(def.tags['home_special']){
                    product.classList.add('featured');
                }
            }
        }
        
        this.dom.productList.appendChild(product);
        if(def.isNew) product.scrollIntoView();
    },
    getFeaturedCategories: function(){
        let featuredCategories = [];
        this.list.forEach(productDefinition => {
            if(productDefinition.tags && productDefinition.tags['home_special']){
                if(featuredCategories.indexOf(productDefinition.tags['home_special']) == -1){
                    featuredCategories.push(productDefinition.tags['home_special']);
                }
            }
        });
        return featuredCategories;
    },
    removeProductDom: function(e){
        if(!confirm("آیا از حذف این محصول اطمینان دارید؟ (توجه: با انجام این کار تمام سفارش های فعال این محصول با مشکل روبرو خواهند شد، قبل از انجام این کار از عدم وجود سفارش فعال روی محصول اطمینان حاصل کنید)")) return;
        e.closest('.product').remove();
    },
    changeProductDomOrder: function(e, state){
        let product = e.closest('.product');
        // console.log($(product))
        let index = $(product).index();
        if(index <= 0 && state) return;
        let ins = state ? main.dom.productList.children[index - 1] : main.dom.productList.children[index + 2];
        main.dom.productList.insertBefore(product, ins);
        product.classList.remove('edited');
        setTimeout(() => {
            product.classList.add('edited');
        });
    },
    editTags: function(e){
        let product = e.closest('.product');
        let tags = JSON.parse(product.getAttribute('data-tags'));
            product.classList.add('editing');

        let tagsEditModalContent = document.querySelector('.edit-tags-modal').cloneNode(true);
            tagsEditModalContent.classList.remove('hidden');
        let cloneableRemoveableTag = tagsEditModalContent.querySelector('.removeable-tag.cloneable').cloneNode(true);
            cloneableRemoveableTag.classList.remove('cloneable');

        for(let key in tags){
            let removeableTag = cloneableRemoveableTag.cloneNode(true);
                removeableTag.querySelector('.removeable-tag-title').textContent = key;
                removeableTag.querySelector('.removeable-tag-value').textContent = tags[key];
                removeableTag.classList.remove('hidden');
                removeableTag.querySelector('.removeable-tag-remove').onclick = function(){
                    this.closest('.removeable-tag').remove();
                    let tags = JSON.parse(product.getAttribute('data-tags'));
                    delete tags[key];
                    product.setAttribute('data-tags', JSON.stringify(tags));
                }
            tagsEditModalContent.querySelector('.tags-container').appendChild(removeableTag);
        }

        let modal;

        // let options = "";
        // main.getFeaturedCategories().forEach(cat => {
        //     options += '\n<option value="' + cat + '">';
        // });
        // tagsEditModalContent.innerHTML += `
        //     <datalist id="featured-categories">
        //         ${options}
        //     </datalist>
        // `;

        tagsEditModalContent.querySelector('.add-tag-btn').onclick = function(){
            let title = this.closest('div').querySelector('.add-tag-title').value,
                value = this.closest('div').querySelector('.add-tag-value').value;
            
            let tags = JSON.parse(product.getAttribute('data-tags'));
            let addingTags = {};
                addingTags[title] = value;
            product.setAttribute('data-tags', JSON.stringify({...tags, ...addingTags}));
            
            modal.remove();
            main.editTags(product);
        }

        modal = this.modalize(tagsEditModalContent, null, function(){
            product.classList.remove('editing');
        });

    },
    serializeProduct: function(product){
        let title = product.querySelector('.product-title').value || '';
        let description = product.querySelector('.product-description').value || '';
        let price = product.querySelector('.product-price').value || '';
        let image = product.querySelector('.product-image').value || '';
        let category = product.querySelector('.product-category').value || '';
        let subCategory = product.querySelector('.product-subcategory').value || category;
        let tags = JSON.parse(product.getAttribute('data-tags'));
        let id = product.getAttribute('data-product-id');
        let boxSell = product.querySelector('#box-sell').checked;
        let singleSell = product.querySelector('#single-sell').checked;
        let offPrice = product.querySelector('.product-off-price').value;
        // return JSON.stringify({title, description, price, image, category});
        return {title, description, price, image, category, subCategory, tags, id, boxSell, singleSell, offPrice};
        // product.querySelector('.product-tags').value = JSON.stringify(def.tags, null, 1) || '';
    },
    saveProducts: function(){
        let list = main.dom.productList.querySelectorAll('.product');
        let result = [];
        list.forEach(product => {
            result.push(main.serializeProduct(product));
        });
        result = JSON.stringify(result);
        $.ajax({
            url: 'https://api.omegarelectrice.com/updateProducts.php',
            type: 'POST',
            data: result,
            success: function(response) {
                console.log("res: " + response);
                toast('success', 'عملیات با موفقیت انجام شد');
                setTimeout(() => location.reload(), 500);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // Handle the error response here
                console.log("Error: " + textStatus + " - " + errorThrown);
                console.log("Status: " + jqXHR.status + " - " + jqXHR.statusText);
                console.log("Content: " + jqXHR.responseText);
            },
        });
    },
    _saveProducts: function(){
        let list = main.dom.productList.querySelectorAll('.product');
        let result = [];
        list.forEach(product => {
            result.push(main.serializeProduct(product));
        });
        result = JSON.stringify(result, null, 2);
        this.saveFile(result);
        document.querySelector('#save-result').value = result;
    },
    async saveFile(fileData, defaultName){
        if(!defaultName) defaultName = 'products.json';

        var picker = await showSaveFilePicker({
            suggestedName: defaultName,
            types: [{
                accept: {'text/plain': ['.json']}
            }],
        });

        var blob = new Blob([fileData]);
        var pickerWritable = await picker.createWritable();
        await pickerWritable.write(blob);
        await pickerWritable.close();
    },
    modalize: function(element, html, onModalClose){
        let modal = document.querySelector('.modal-wrapper').cloneNode(true);
            modal.classList.remove('hidden');
        if(html){
            modal.querySelector('.modal-foreground').innerHTML = html;
        }
        if(element){
            modal.querySelector('.modal-foreground').appendChild(element);
        }
        // modal.querySelector('.modal-close').onclick = function(){
        //     modal.remove();
        // }
        let background = modal.querySelector('.modal-background');
            background.onclick = function(e){
                if(e.target === background){
                    modal.remove();
                    if(onModalClose){
                        onModalClose();
                    }
                }
            }
        document.body.appendChild(modal);
        return modal;
    }
}

main.init();