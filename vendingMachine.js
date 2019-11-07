class VendingMachine {

    constructor(vendingProducts, vendingMoney, nominalValues) {
        this._productsStore = vendingProducts;
        this._moneyStore = vendingMoney;
        this._paidMoney = {};
        this._nominalMapping = nominalValues;
        this._errorOutOfStock = 'ERROR_OUT_OF_STOCK';
        this._errorNotPaid = 'ERROR_NOT_PAID';
        this._errorNoChange = 'ERROR_NO_CHANGE';
        this._statusOK = 'OK';
    }

    isCoin(value) {
        return this._moneyStore[value];
    }

    isSlot(value) {
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
                let userCoinCount = this._paidMoney[nominalObj[0]] ? this._paidMoney[nominalObj[0]] : 0;
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
            let userCoinCount = this._paidMoney[element] ? this._paidMoney[element] : 0;
            this._moneyStore[element] = this._moneyStore[element] + userCoinCount - 1;
        });
        /* Increment amount of coins received by user */
        Object.keys(this._moneyStore).forEach(key => {
            let userCoinCount = this._paidMoney[key] ? this._paidMoney[key] : 0;
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
    processOrder(slotId, product, messages) {
        let changeObj = [];
        let diff = (this.calculateTotalAmount(this._paidMoney) - product.price) * 100;
        let sortedNominalMapping = this.getNominalMappingArrayAsc();
        /* Cannot return change less than 5c */
        if (diff >= sortedNominalMapping[0][1]) {
            changeObj = this.calculateChange(diff, sortedNominalMapping);
        }
        if (changeObj.length > 0) {
            this.updateMoneyInventory(changeObj);
            this.updateProductInventory(slotId);
            this.resetUserPayment();
            console.log(`${messages.enjoyMessage}`);
            console.log(`${messages.itemMessage} ${product.name}`);
            console.log(`${messages.changeMessage} ${changeObj.join(',')}\n`);
            return true;
        }
        return false;
    }

    processSlotSelection(slotId, messages) {
        let product = this._productsStore[slotId];
        if (product.qty < 1) {
            return this._errorOutOfStock;
        }
        if (product.price > this.calculateTotalAmount(this._paidMoney)) {
            return this._errorNotPaid;
        }
        if (!this.processOrder(slotId, product, messages)) {
            this.resetUserPayment();
            return this._errorNoChange
        }

        return this._statusOK;
    }

    get errorNotAvailable() {
        return this._errorOutOfStock;
    }

    get errorNotPaid() {
        return this._errorNotPaid;
    }

    get statusOK() {
        return this._statusOK;
    }

    get errorNoChange() {
        return this._errorNoChange;
    }

    get productsStore() {
        return this._productsStore;
    }
}

module.exports = VendingMachine;


