let Messages = require('./messages');
const readLine = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

function askForSelection() {
    return new Promise(resolve => readLine.question('Enter = ', response => resolve(response)));
}

class ConsoleProcessor {

    displayWelcomeMessage(slots) {
        let messages = new Messages();
        console.log(messages.titleMessage);
        console.log(messages.headerMessage);
        Object.keys(slots).forEach(key => {
            let slotObj = slots[key];
            var slotId = key.replace(/^\w/, c => c.toUpperCase());
            console.log(`${slotId} - ${slotObj.qty} x ${slotObj.name} = ${slotObj.price.toFixed(2)}\n`);
        })
        console.log(messages.coinsMessage);
        console.log(messages.actionsCoinMessage);
        console.log(messages.actionsSlotMsg);
    }

    async getUserInput(vendindMachine) {
        let choice;
        do {
            choice = (await askForSelection()).toLowerCase();
            if (vendindMachine.isCoin(choice)) {
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
}

module.exports = ConsoleProcessor;
