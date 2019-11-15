/* Calculates total amount */
function calculateTotalAmount(vault, mapping) {
    return Object.keys(vault).reduce((total, key) => (total +  (vault[key] * mapping[key] / 100)), 0);
}

export default class VendingMachine {

    constructor(vendingProducts, vendingMoney, nominalValues) {
        this._productsStore = vendingProducts;
        this._moneyStore = vendingMoney;
        this._paidMoney = {};
        Object.keys(vendingMoney).forEach(key => {
            this._paidMoney[key] = 0;
        })
        this._nominalMapping = nominalValues;
    }

    isCoin(coinId) {
        return this._moneyStore.hasOwnProperty(coinId);
    }

    getSlot(slotId) {
        return this._productsStore[slotId];
    }

    /* Increments coins dropped by user */
    addUserCoin(moneyId) {
        if (!this.isCoin(moneyId)) {
            throw new Error('Invalid coin');
        }
        this._paidMoney[moneyId] += 1;
        return calculateTotalAmount(this._paidMoney, this._nominalMapping);
    }

    /* Resets user payment, i.e. does not take money from user */
    resetUserPayment() {
        Object.keys(this._paidMoney).forEach(key => (this._paidMoney[key] = 0));
    }

    /* Builds array of all coins for the change or empty array */
    calculateChange(diff, sortedNominalMapping) {
        let change = [];
        let totalDiffValue = diff;
        sortedNominalMapping.reverse().forEach(nominalObj => {
            if (totalDiffValue >= nominalObj[1]) {
                let coinsCount = Math.floor(totalDiffValue / nominalObj[1]);
                let userCoinCount = this._paidMoney[nominalObj[0]];
                let aggregatedCoinCount = this._moneyStore[nominalObj[0]] + userCoinCount;
                coinsCount = Math.min(coinsCount, aggregatedCoinCount);
                if (coinsCount > 0) {
                    totalDiffValue = totalDiffValue - (coinsCount * nominalObj[1]);
                    change = change.concat(Array(coinsCount).fill(nominalObj[0]));
                }
            }
        });
        return (totalDiffValue < 1 ? change : []);
    }

    /* Decrements number of coins due to change return and re-calculates total*/
    updateMoneyInventory(changeObj) {
        /* Increment amount of coins received by user */
        Object.keys(this._moneyStore).forEach(key => {
            this._moneyStore[key] += this._paidMoney[key];
        })
        /* Decrement amount of returned coins */
        changeObj.forEach(element => {
            this._moneyStore[element] -= 1;
        });

    }

    /* Decrements product stock level */
    updateProductInventory(slotId) {
        this._productsStore[slotId].qty -= 1;
    }

    /* Processes user's selection, generates change, updates inventory */
    processSlotSelection(slotId) {
        let changeObj = [];
        let product = this._productsStore[slotId];
        let sortNominalMappingAsc = (mapping) => {
            return Object.entries(mapping).sort((a, b) => {
                if (a[1] < b[1]) {
                    return -1;
                } else if (a[1] > b[1]) {
                    return 1;
                }
                return 0;
            });
        };
        let diff = (calculateTotalAmount(this._paidMoney, this._nominalMapping) - product.price) * 100;
        let sortedNominalMapping = sortNominalMappingAsc(this._nominalMapping);
        /* Cannot return change less than 5c */
        if (diff >= sortedNominalMapping[0][1]) {
            changeObj = this.calculateChange(diff, sortedNominalMapping);
        }
        if (changeObj.length > 0) {
            this.updateMoneyInventory(changeObj);
            this.updateProductInventory(slotId);
        }
        this.resetUserPayment();
        return changeObj;
    }

    isProductPurchaseable(slotId) {
        let product = this._productsStore[slotId];
        return (typeof product !== 'undefined' && product.price < calculateTotalAmount(this._paidMoney, this._nominalMapping));
    }

    isProductAvailable(slotId) {
        let product = this._productsStore[slotId];
        return (typeof product !== 'undefined' && product.qty > 0);
    }

    get productsStore() {
        return this._productsStore;
    }

    get moneyStore() {
        return this._moneyStore;
    }
}
