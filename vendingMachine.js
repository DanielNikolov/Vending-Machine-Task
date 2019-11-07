class VendingMachine {

    constructor(vendingProducts, vendingMoney, userPaid, nominalValues) {
        this._productsStore = vendingProducts;
        this._moneyStore = vendingMoney;
        this._paidMoney = userPaid;
        this._nominalMapping = nominalValues;
    }

    isCoin(value) {
        return this._moneyStore[value] !== null;
    }

    isSlot(value) {
        return this._productsStore[value] !== null;
    }

    generateChangeMsg(arrChange) {
        console.log(`Change = ${arrChange.join(',')}`);
    }

    /* Calculate all the money given by user */
    updatePaidAmound(moneyId) {
        this._paidMoney[moneyId] += 1;
        this._paidMoney.total = Object.keys(this._paidMoney).reduce((total, key) => {
            if (this._moneyStore[key] != null && this._moneyStore[key].hasOwnProperty('value')) {
                return total +  (this._paidMoney[key] * this._moneyStore[key].value);
            } else {
                return total;
            }
        }, 0);
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
    calculateChange(diff) {
        let change = [];
        let totalDiffValue = diff;
        this._nominalMapping.reverse().forEach(nominalObj => {
            if (totalDiffValue >= nominalObj.value) {
                let coinsCount = Math.floor(totalDiffValue / nominalObj.value);
                let aggregatedCoinCount = this._moneyStore[nominalObj.code].qty + this._paidMoney[nominalObj.code];
                coinsCount = Math.min(coinsCount, aggregatedCoinCount);
                if (coinsCount > 0) {
                    totalDiffValue = totalDiffValue - (coinsCount * nominalObj.value);
                    let strCoinIds = (nominalObj.code + ',').repeat(coinsCount);
                    change = change.concat(strCoinIds.substring(0, strCoinIds.length-1).split(','));
                }
            }
        });
        return (totalDiffValue < 1 ? change : []);
    }

    /* Decrements number of coins due to change return and re-calculates total*/
    updateMoneyInventory(changeObj) {
        /* Decrement amount of returned coins */
        changeObj.forEach(element => {
            this._moneyStore[element].qty = this._moneyStore[element].qty + this._paidMoney[element] - 1;
        });
        /* Increment amount of coins received by user */
        Object.keys(this._moneyStore).forEach(key => {
            if (key !== 'total' && changeObj.indexOf(key) < 0) {
                this._moneyStore[key].qty = this._moneyStore[key].qty + this._paidMoney[key];
            }
        })
        /* Calculates total available money in store */
        this._moneyStore.total = Object.keys(this._moneyStore).reduce((total, key) => {
            if (this._moneyStore[key].hasOwnProperty('value')) {
                return total +  (this._moneyStore[key].qty * this._moneyStore[key].value);
            } else {
                return total;
            }
        }, 0);
    }

    /* Decrements product stock level */
    updateProductInventory(slotId) {
        this._productsStore[slotId].qty -= 1;
    }

    /* Processes user's selection, generates change, updates inventory */
    processOrder(slotId, product) {
        //let aggregatedMoneyStore = this.getAggregatedMoneyStore();
        let changeObj = [];
        let diff = (this._paidMoney.total - product.price) * 100;
        /* Cannot return change less than 5c */
        if (diff >= this._nominalMapping[0].value) {
            changeObj = this.calculateChange(diff);
        }
        if (changeObj.length > 0) {
            this.updateMoneyInventory(changeObj);
            this.updateProductInventory(slotId);
            this.resetUserPayment();
            console.log('Enjoy!');
            console.log(`Item = ${product.name}`);
            this.generateChangeMsg(changeObj);

            return true;
        }
        return false;
    }

    /* Asks user for action */
    async getUserSelection() {
        let choice;
        do {
            choice = (await askForSelection()).toLowerCase();
            if (this._moneyStore[choice] != null) {
                this.updatePaidAmound(choice);
                console.log(`Tendered = ${this._paidMoney.total.toFixed(2)}\n`);
            }
            if (this._productsStore[choice] != null) {
                let productObj = this._productsStore[choice];
                if (productObj.qty < 1) {
                    console.log('This product is not available. Please try again.')
                    this.resetUserPayment();
                } else if (productObj.price > this._paidMoney.total) {
                    console.log('The amount paid is not enough. Please try again.');
                } else if (!this.processOrder(choice, productObj)) {
                    console.log('Not enough availability. Cannot return change.');
                    this.resetUserPayment();
                }
            }
            if (choice === 'inventory') {
                this.getInventory();
            }
        } while (choice !== 'exit');
    }

    displayWelcomeMsg() {
        console.log('Welcome to the Vending Machine simulator!\n');
		console.log('The vending machine contains the following products\n');
        Object.keys(this._productsStore).forEach((key) => {
            let slotObj = this._productsStore[key];
            var slotId = key.replace(/^\w/, c => c.toUpperCase());
            console.log(`${slotId} - ${slotObj.qty} x ${slotObj.name} = ${slotObj.price.toFixed(2)}\n`);
        });
        console.log('The vending machine accepts the following coins\n5c 10c 20c 50c $1 $2\n');
        console.log('Please insert coins one at a time and pressing enter after each, eg. $2 or 5c\n');
        console.log('To vend from a slot type slot command, e.g. slot 1\n');
        this.getUserSelection();
    }

    get productsStore() {
        return this._productsStore;
    }
}

module.exports = VendingMachine;


