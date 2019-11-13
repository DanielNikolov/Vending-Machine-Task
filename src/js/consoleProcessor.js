let config = require('./config.js');
let VendingMachine = require('./vendingMachine');
let Messages = require('./messages');

const readLine = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});


class ConsoleProcessor {

    constructor() {
        this._vendingMachine = new VendingMachine(config.products, config.money, config.nominalMapping);
        this._messages = new Messages();
    }

    displayWelcomeMessage() {
        console.log(this._messages.titleMessage);
        console.log(this._messages.headerMessage);
        Object.keys(this._vendingMachine.productsStore).forEach(key => {
            let slotObj = this._vendingMachine.productsStore[key];
            var slotId = key.replace(/^\w/, c => c.toUpperCase());
            console.log(`${slotId} - ${slotObj.qty} x ${slotObj.name} = ${slotObj.price.toFixed(2)}\n`);
        })
        console.log([this._messages.coinsMessage, this._messages.actionsCoinMessage, this._messages.actionsSlotMessage].join('\n'));
    }

    async getUserInput() {
        let choice;
        do {
            let askForSelection = () => {
                return new Promise(resolve => readLine.question(`${this._messages.enterSelectionMessage}`, response => resolve(response)));
            }
            choice = (await askForSelection()).toLowerCase();
            let product = this._vendingMachine.getSlot(choice);
            if (this._vendingMachine.isCoin(choice)) {
                console.log(`${this._messages.tenderedMessage} ${this._vendingMachine.addUserCoin(choice).toFixed(2)}\n`);
            } else if (product) {
                if (product.qty < 1) {
                    console.log(`${this._messages.outOfStockMessage}`);
                } else if (!this._vendingMachine.isProductPurchaseable(choice)) {
                    console.log(`${this._messages.notPaidMessage}`);
                } else {
                    let result = this._vendingMachine.processSlotSelection(choice);
                    if (result.length > 0) {
                        console.log(this._messages.enjoyMessage);
                        console.log(`${this._messages.itemMessage} ${product.name}`);
                        console.log(`${this._messages.changeMessage} ${result.join(',')}\n`);
                    } else {
                        console.log(this._messages.noChangeMessage);
                    }
                }
            } else if (choice === 'inventory') {
                console.log('Cache Inventory:')
                console.log(this._vendingMachine.moneyStore);
                console.log('Products Inventory:')
                console.log(this._vendingMachine.productsStore)
            } else if (choice !== 'exit') {
                console.log(`${this._messages.invalidChoiceMessage}`);
            }
        } while (choice !== 'exit');
    }
}

module.exports = ConsoleProcessor;
