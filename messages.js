class Messages {
    constructor() {
        this._titleMessage = 'Welcome to the Vending Machine simulator!\n';
        this._headerMessage = 'The vending machine contains the following products\n';
        this._coinsMessage = 'The vending machine accepts the following coins\n5c 10c 20c 50c $1 $2\n';
        this._actionsCoinMessage = 'Please insert coins one at a time and pressing enter after each, eg. $2 or 5c\n';
        this._actionsSlotMsg = 'To vend from a slot type slot command, e.g. slot 1\n';
    }

    get titleMessage() {
        return this._titleMessage;
    }

    get headerMessage() {
        return this._headerMessage;
    }

    get coinsMessage() {
        return this._coinsMessage;
    }

    get actionsCoinMessage() {
        return this._actionsCoinMessage;
    }

    get actionsSlotMsg() {
        return this._actionsSlotMsg;
    }
}

module.exports = Messages;