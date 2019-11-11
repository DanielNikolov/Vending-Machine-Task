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

    askForSelection() {
        return new Promise(resolve => readLine.question(`${this._messages.enterSelectionMessage}`, response => resolve(response)));
    }

    displayWelcomeMessage() {
        console.log(this._messages.titleMessage);
        console.log(this._messages.headerMessage);
        Object.keys(this._vendingMachine.productsStore).forEach(key => {
            let slotObj = this._vendingMachine.productsStore[key];
            var slotId = key.replace(/^\w/, c => c.toUpperCase());
            console.log(`${slotId} - ${slotObj.qty} x ${slotObj.name} = ${slotObj.price.toFixed(2)}\n`);
        })
        console.log(this._messages.coinsMessage);
        console.log(this._messages.actionsCoinMessage);
        console.log(this._messages.actionsSlotMessage);
    }

    async getUserInput() {
        let choice;
        do {
            choice = (await this.askForSelection()).toLowerCase();
            if (this._vendingMachine.isCoin(choice)) {
                console.log(`${this._messages.tenderedMessage} ${this._vendingMachine.addUserCoin(choice).toFixed(2)}\n`);
            } else if (this._vendingMachine.isSlot(choice)) {
                let result = this._vendingMachine.processSlotSelection(choice, this._messages);

                if (result === this._vendingMachine.errorNotAvailable) {
                    console.log(`${this._messages.outOfStockMessage}`);
                } else if (result === this._vendingMachine.errorNotPaid) {
                    console.log(`${this._messages.notPaidMessage}`);
                } else if (result === this._vendingMachine.errorNoChange) {
                    console.log(`${this._messages.noChangeMessage}`);
                }
            } else if (choice === 'inventory') {
                this._vendingMachine.getInventory();
            } else if (choice !== 'exit') {
                console.log(`${this._messages.invalidChoiceMessage}`);
            }
        } while (choice !== 'exit');
    }
}

module.exports = ConsoleProcessor;
