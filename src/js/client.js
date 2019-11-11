let config = require('./config.js');
let VendingMachine = require('./vendingMachine');

window.vendingMachine = new VendingMachine(config.products, config.money, config.nominalMapping);

function loadProducts() {
    Object.keys(window.vendingMachine.productsStore).forEach(key => {
        let productObj = window.vendingMachine.productsStore[key];
        let productDivStr = '<div class="product d-flex col-lg-3 col-sm-4 col-6">' +
            '<span class="product__name row col-12 justify-content-center align-items-center">' +
            productObj.name + '</span></div>';
        $('.products').append($(productDivStr));
    });
}

$(document).ready(() => {
    loadProducts();
})
