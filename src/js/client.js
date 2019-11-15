import Config from './config.js';
import VendingMachine from './vendingMachine';
const config = new Config();

window.vendingMachine = new VendingMachine(config.products, config.money, config.nominalMapping);

function loadProducts() {
    $('.products').empty();
    Object.keys(window.vendingMachine.productsStore).forEach(key => {
        let productObj = window.vendingMachine.productsStore[key];
        let $product = $('<div class="product d-flex col-lg-3 col-sm-4 col-6 justify-content-center align-items-center" data-slotid="' + key + '"></div>');
        let $productDetails = $('<div class="details"></div>');
        let $productName = $('<span class="product__name col-12 d-flex justify-content-center"></span>');
        $productName.html('<strong>' + productObj.name + '</strong>');
        let $productQty = $('<span class="product__qty col-12 d-flex justify-content-center">Qty: ' + productObj.qty + '</span>');
        let $productPrice = $('<span class="product__price col-12 d-flex justify-content-center">$' + productObj.price.toFixed(2) + '</span>');
        $productDetails.append($productName, $productQty, $productPrice);
        $product.append($productDetails);
        if (productObj.qty < 1) {
            $product.addClass('product--disabled');
        }
        $('.products').append($product);
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
        let $coinButton = $('<div class="coin d-flex col-lg-3 col-sm-4 col-6 justify-content-center align-items-center" data-coinid="' + element[0] + '"></div>');
        $coinButton.append('<span><strong>' + element[0] + '</strong></span>');
        $('.moneypad').append($coinButton);
    });

    let $resetButton = $('<div class="reset coin d-flex col-lg-3 col-sm-4 col-6 justify-content-center align-items-center"></div>');
    $resetButton.append('<span><strong>Reset</strong></span>');
    $('.moneypad').append($resetButton);
}

function initEvents() {
    $(document).on('click', '.product:not(.product--disabled)', function () {
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
            }
            $('.totals__paid').html('<strong>Total Paid:</strong> $0.00');
        }
    });

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
    initEvents();
})
