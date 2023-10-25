// const axios = require('axios/dist/browser/axios.cjs');
// import { renderToStaticMarkup } from "react-dom/server"

let campaginCardContainer = document.querySelector('.campaign-container');

async function loadCampaigns(){
    try {
        let {data} = await axios.get(API_ROUTE + 'json/campaigns.json');
        return data;
    } catch(e){
        if(e.request.status == 404){
            let post = await axios.post(API_ROUTE + 'putJson.php?name=campaigns.json', '');
            window.location.reload();
        }
    }

}

(async function(){
    let campaigns = await loadCampaigns();

    document.querySelector('#add-campaign-btn').onclick = function(){
        let card = document.querySelector('.campaign-card.cloneable').cloneNode(true);
        campaginCardContainer.appendChild(card);

    }

    Sortable.create(campaginCardContainer, {
        // animation: 150,
        // easing: "cubic-bezier(1, 0, 0, 1)",
        // handle: '.sortable-handle',
        // ghostClass: "sortable-ghost",

        animation: 100,
        draggable: '.campaign-card',
        // handle: '.fa-bars',
        sort: true,
        filter: '.sortable-disabled',
        ghostClass: 'sortable-active',
        forceFallback: true,
    });

    if(!campaigns) return;

})();