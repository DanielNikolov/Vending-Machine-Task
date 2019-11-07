const readLine = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

function askForSelection() {
    return new Promise(resolve => readLine.question('Enter = ', response => resolve(response)));
}

class VendingMachine {

    constructor(vendingProducts, vendingMoney, nominalValues) {
        this._productsStore = vendingProducts;
        this._moneyStore = vendingMoney;
        this._paidMoney = {};
        this._nominalMapping = nominalValues;
    }

    generateChangeMsg(arrChange) {
        console.log(`Change = ${arrChange.join(',')}`);
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
    processOrder(slotId, product) {
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
                this.addUserCoin(choice);
                console.log(`Tendered = ${this.calculateTotalAmount(this._paidMoney).toFixed(2)}\n`);
            }
            if (this._productsStore[choice] != null) {
                let productObj = this._productsStore[choice];
                if (productObj.qty < 1) {
                    console.log('This product is not available. Please select another product or type exit.')
                } else if (productObj.price > this.calculateTotalAmount(this._paidMoney)) {
                    console.log('The amount paid is not enough. You need to add more coins or type exit.');
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
}

module.exports = VendingMachine;


