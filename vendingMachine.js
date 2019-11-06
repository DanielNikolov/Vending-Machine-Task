const readLine = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

function askForSelection() {
    return new Promise(resolve => readLine.question('Enter = ', response => resolve(response)));
}

class VendingMachine {

    constructor(vendingProducts, vendingMoney, userPaid, nominalValues) {
        this.productsStore = vendingProducts;
        this.moneyStore = vendingMoney;
        this.paidMoney = userPaid;
        this.nominalMapping = nominalValues;
    }

    generateChangeMsg(arrChange) {
        let coinIds = [];
        arrChange.forEach(element => {
            for (let i = 0; i < element.qty; i++) {
                coinIds.push(element.code);
            }
        });

        console.log(`Change = ${coinIds.join(',')}`);
    }

    /* Calculate all the money given by user */
    updateTotalPaidAmound(moneyId) {
        this.paidMoney[moneyId] += 1;
        this.paidMoney.total = Object.keys(this.paidMoney).reduce((total, key) => {
            if (this.moneyStore[key] != null && this.moneyStore[key].hasOwnProperty('value')) {
                return total +  (this.paidMoney[key] * this.moneyStore[key].value);
            } else {
                return total;
            }
        }, 0);
    }

    /* Resets user payment, i.e. does not take money from user */
    resetUserPayment() {
        Object.keys(this.paidMoney).forEach(key => {
            this.paidMoney[key] = 0;
        });
    }

    /* Displays debug information about products and money availability */
    getInventory() {
        console.log('Cache Inventory: ');
        console.log(this.moneyStore);
        console.log('Products Inventory: ');
        console.log(this.productsStore);
    }

    /* Builds aggregated vault by coin type - vending cache and user's money */
    getAggregatedMoneyStore() {
        let aggregatedStore = {};
        Object.keys(this.moneyStore).forEach(key => {
            if (key !== 'total') {
                aggregatedStore[key] = this.moneyStore[key].qty + this.paidMoney[key];
            }
        });
        aggregatedStore.total = this.moneyStore.total + this.paidMoney.total;
        return aggregatedStore;
    }

    /* Builds array of all coins for the change or empty array */
    calculateChange(diff, aggregatedMoneyStore) {
        let change = [];
        let totalDiffValue = diff;
        this.nominalMapping.reverse().forEach(nominalObj => {
            if (totalDiffValue >= nominalObj.value) {
                let coinsCount = Math.floor(totalDiffValue / nominalObj.value);
                coinsCount = Math.min(coinsCount, aggregatedMoneyStore[nominalObj.code]);
                if (coinsCount > 0) {
                    totalDiffValue = totalDiffValue - (coinsCount * nominalObj.value);
                    change.push({code: nominalObj.code, qty: coinsCount});
                }
            }
        });
        return (totalDiffValue < 1 ? change : []);
    }

    /* Decrements number of coins due to change return and re-calculates total*/
    updateMoneyInventory(changeObj, aggregatedMoneyStore) {
        changeObj.forEach(element => {
            aggregatedMoneyStore[element.code] = aggregatedMoneyStore[element.code] - element.qty;
        });
        Object.keys(aggregatedMoneyStore).forEach(key => {
            if (key !== 'total') {
                this.moneyStore[key].qty = aggregatedMoneyStore[key];
            }
        });
        this.moneyStore.total = Object.keys(this.moneyStore).reduce((total, key) => {
            if (this.moneyStore[key].hasOwnProperty('value')) {
                return total +  (this.moneyStore[key].qty * this.moneyStore[key].value);
            } else {
                return total;
            }
        }, 0);
    }

    /* Decrements product stock level */
    updateProductInventory(slotId) {
        this.productsStore[slotId].qty -= 1;
    }

    /* Processes user's selection, generates change, updates inventory */
    processOrder(slotId, product) {
        let aggregatedMoneyStore = this.getAggregatedMoneyStore();
        let changeObj = [];
        let diff = (this.paidMoney.total - product.price) * 100;
        /* Cannot return change less than 5c */
        if (diff >= this.nominalMapping[0].value) {
            changeObj = this.calculateChange(diff, aggregatedMoneyStore);
        }
        if (changeObj.length > 0) {
            this.updateMoneyInventory(changeObj, aggregatedMoneyStore);
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
            if (this.moneyStore[choice] != null) {
                this.updateTotalPaidAmound(choice);
                console.log(`Tendered = ${this.paidMoney.total.toFixed(2)}\n`);
            }
            if (this.productsStore[choice] != null) {
                let productObj = this.productsStore[choice];
                if (productObj.qty < 1) {
                    console.log('This product is not available. Please try again.')
                    this.resetUserPayment();
                } else if (productObj.price > this.paidMoney.total) {
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
        Object.keys(this.productsStore).forEach((key) => {
            let slotObj = this.productsStore[key];
            var slotId = key.replace(/^\w/, c => c.toUpperCase());
            console.log(`${slotId} - ${slotObj.qty} x ${slotObj.name} = ${slotObj.price.toFixed(2)}\n`);
        });
        console.log('The vending machine accepts the following coins\n5c 10c 20c 50c $1 $2\n');
        console.log('Please insert coins one at a time and pressing enter after each, eg. $2 or 5c\n');
        console.log('To vend from a slot type slot command, e.g. slot 1\n');
        this.getUserSelection();
    }
}

module.exports = VendingMachine;


