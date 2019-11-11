let config = require('./config.js');
let VendingMachine = require('./vendingMachine');

window.vendingMachine = new VendingMachine(config.products, config.money, config.nominalMapping);

function loadProducts() {
    Object.keys(window.vendingMachine.productsStore).forEach(key => {
        let productObj = window.vendingMachine.productsStore[key];
        let productDivStr =
            '<div class="product d-flex col-lg-3 col-sm-4 col-6 justify-content-center align-items-center">' +
                '<div class="details">' +
                    '<span class="product__name col-12 d-flex justify-content-center">' +
                    productObj.name +
                    '</span>' +
                    '<span class="product__qty col-12 d-flex justify-content-center">Qty: ' + productObj.qty + '</span>' +
                '</div>' +
            '</div>';
        $('.products').append($(productDivStr));
    });
}

$(document).ready(() => {
    loadProducts();
})
