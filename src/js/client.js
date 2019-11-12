let config = require('./config.js');
let VendingMachine = require('./vendingMachine');

window.vendingMachine = new VendingMachine(config.products, config.money, config.nominalMapping);

function loadProducts() {
    $('.products').empty();
    Object.keys(window.vendingMachine.productsStore).forEach(key => {
        let productObj = window.vendingMachine.productsStore[key];
        let productDivStr =
            '<div class="product d-flex col-lg-3 col-sm-4 col-6 justify-content-center align-items-center" data-slotid="' + key + '">' +
                '<div class="details">' +
                    '<span class="product__name col-12 d-flex justify-content-center">' +
                        '<strong>' + productObj.name + '</strong>' +
                    '</span>' +
                    '<span class="product__qty col-12 d-flex justify-content-center">Qty: ' + productObj.qty + '</span>' +
                    '<span class="product__price col-12 d-flex justify-content-center">$' + productObj.price.toFixed(2) + '</span>' +
                '</div>' +
            '</div>';
        let $productDiv = $(productDivStr);
        if (productObj.qty < 1) {
            $productDiv.addClass('product--disabled');
        }
        $('.products').append($productDiv);
    });
}

function loadMoneyOptions() {
    let sortedNominalMapping = Object.entries(config.nominalMapping).sort((a, b) => {
        if (a[1] < b[1]) {
            return -1
        } else if (a[1] > b[1]) {
            return 1;
        }
        return 0;
    });
    sortedNominalMapping.forEach(element => {
        let coinButtonStr =
            '<div class="coin d-flex col-lg-3 col-sm-4 col-6 justify-content-center align-items-center" data-coinid="' + element[0] + '">' +
                '<span><strong>' + element[0] + '</strong></span>' +
            '</div>';
        $('.moneypad').append($(coinButtonStr))
    });
    let resetButtonStr =
        '<div class="reset coin d-flex col-lg-3 col-sm-4 col-6 justify-content-center align-items-center">' +
            '<span><strong>Reset</strong></span>' +
        '</div>';
    $('.moneypad').append($(resetButtonStr));
}

function initProductEvents() {
    $('.product:not(.product--disabled)').click(function () {
        if (!window.vendingMachine.isProductPurchaseable($(this).data('slotid'))) {
            $('.totals__error').html('Not enough money to buy selected product');
        } else {
            let processResult = window.vendingMachine.processSlotSelection($(this).data('slotid'));
            if (processResult.length < 1) {
                $('.totals__error').html('Cannot return change');
                $('.totals__change').html('<strong>Change:</strong>');
            } else {
                $('.totals__error').html('');
                $('.totals__change').html('<strong>Change:</strong> ' + processResult.join(', '));
                loadProducts();
                initProductEvents();
            }
            $('.totals__paid').html('<strong>Total Paid:</strong> $0.00');
        }
    });
}

function initMoneyPadEvents() {
    $('.coin:not(.reset)').click(function () {
        let totalPaid = window.vendingMachine.addUserCoin($(this).data('coinid')).toFixed(2);
        $('.totals__paid').html('<strong>Total Paid:</strong> $' + totalPaid);
    })

    $('.reset').click(function () {
        window.vendingMachine.resetUserPayment();
        $('.totals__error').html('');
        $('.totals__change').html('<strong>Change:</strong>');
        $('.totals__paid').html('<strong>Total Paid:</strong> $0.00');
    })
}

$(document).ready(() => {
    loadProducts();
    loadMoneyOptions();
    initProductEvents();
    initMoneyPadEvents();
})
