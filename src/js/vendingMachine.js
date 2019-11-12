class VendingMachine {

    constructor(vendingProducts, vendingMoney, nominalValues) {
        this._productsStore = vendingProducts;
        this._moneyStore = vendingMoney;
        this._paidMoney = {};
        Object.keys(vendingMoney).forEach(key => {
            this._paidMoney[key] = 0;
        })
        this._nominalMapping = nominalValues;
    }

    isCoin(value) {
        return this._moneyStore[value];
    }

    getSlot(value) {
        return this._productsStore[value];
    }

    getNominalMappingArrayAsc() {
        return Object.entries(this._nominalMapping).sort((a, b) => {
            if (a[1] < b[1]) {
                return -1
            } else if (a[1] > b[1]) {
                return 1;
            }
            return 0;
        });
    }

    /* Calculates total amount */
    calculateTotalAmount(vault) {
        return Object.keys(vault).reduce((total, key) => {
            return total +  (vault[key] * this._nominalMapping[key] / 100);
        }, 0);
    }

    /* Increments coins dropped by user */
    addUserCoin(moneyId) {
        if (!this._paidMoney[moneyId]) {
            this._paidMoney[moneyId] = 0;
        }
        this._paidMoney[moneyId] += 1;

        return this.calculateTotalAmount(this._paidMoney);
    }

    /* Resets user payment, i.e. does not take money from user */
    resetUserPayment() {
        Object.keys(this._paidMoney).forEach(key => {
            this._paidMoney[key] = 0;
        });
    }

    /* Displays debug information about products and money availability */
    getInventory() {
        console.log('Cache Inventory: ');
        console.log(this._moneyStore);
        console.log('Products Inventory: ');
        console.log(this._productsStore);
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
        /* Decrement amount of returned coins */
        changeObj.forEach(element => {
            let userCoinCount = this._paidMoney[element];
            this._moneyStore[element] = this._moneyStore[element] + userCoinCount - 1;
        });
        /* Increment amount of coins received by user */
        Object.keys(this._moneyStore).forEach(key => {
            let userCoinCount = this._paidMoney[key];
            if (changeObj.indexOf(key) < 0) {
                this._moneyStore[key] += userCoinCount;
            }
        })
    }

    /* Decrements product stock level */
    updateProductInventory(slotId) {
        this._productsStore[slotId].qty -= 1;
    }

    /* Processes user's selection, generates change, updates inventory */
    processSlotSelection(slotId) {
        let changeObj = [];
        let product = this._productsStore[slotId];
        let diff = (this.calculateTotalAmount(this._paidMoney) - product.price) * 100;
        let sortedNominalMapping = this.getNominalMappingArrayAsc();
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
        return (product.price < this.calculateTotalAmount(this._paidMoney));
    }

    isProductAvailable(slotId) {
        return (this._productsStore[slotId].qty > 0);
    }

    get productsStore() {
        return this._productsStore;
    }

    get moneyStore() {
        return this._moneyStore;
    }
}

module.exports = VendingMachine;
