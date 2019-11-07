class Messages {
    constructor() {
        this._titleMessage = 'Welcome to the Vending Machine simulator!\n';
        this._headerMessage = 'The vending machine contains the following products\n';
        this._coinsMessage = 'The vending machine accepts the following coins\n5c 10c 20c 50c $1 $2\n';
        this._actionsCoinMessage = 'Please insert coins one at a time and pressing enter after each, eg. $2 or 5c\n';
        this._actionsSlotMessage = 'To vend from a slot type slot command, e.g. slot 1\n';
        this._tenderedMessage = 'Tendered =';
        this._outOfStockMessage = 'This product is not available. Please try again.\n';
        this._notPaidMessage = 'The amount paid is not enough. Please try again.\n';
        this._noChangeMessage = 'Not enough availability. Cannot return change.\n'
        this._enjoyMessage = 'Enjoy!\n';
        this._itemMessage = 'Item =';
        this._changeMessage = 'Change =';
        this._enterSelectionMessage = 'Enter = ';
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

    get actionsSlotMessage() {
        return this._actionsSlotMessage;
    }

    get tenderedMessage() {
        return this._tenderedMessage;
    }

    get outOfStockMessage() {
        return this._outOfStockMessage;
    }

    get notPaidMessage() {
        return this._notPaidMessage;
    }

    get enjoyMessage() {
        return this._enjoyMessage;
    }

    get itemMessage() {
        return this._itemMessage;
    }

    get changeMessage() {
        return this._changeMessage;
    }

    get noChangeMessage() {
        return this._noChangeMessage;
    }

    get enterSelectionMessage() {
        return this._enterSelectionMessage;
    }
}

module.exports = Messages;