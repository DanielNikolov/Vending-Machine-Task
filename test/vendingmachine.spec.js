let assert = require('assert');

const config = {
    products: {
        'slot 1': {
            name: 'Snickers',
            price: 1.05,
            qty: 3
        },
        'slot 2': {
            name: 'Bounty',
            price: 1.00,
            qty: 0
        },
        'slot 3': {
            name: 'Mars',
            price: 1.25,
            qty: 1
        },
        'slot 4': {
            name: 'Twix',
            price: 2.00,
            qty: 2
        },
        'slot 5': {
            name: 'Wispa',
            price: 1.80,
            qty: 2
        },
        'slot 6': {
            name: 'Twirl',
            price: 0.75,
            qty: 2
        },
        'slot 7': {
            name: 'Yorkie',
            price: 1.80,
            qty: 3
        },
        'slot 8': {
            name: 'Aero',
            price: 1.80,
            qty: 0
        },
        'slot 9': {
            name: 'Double Decker',
            price: 0.75,
            qty: 3
        },
        'slot 10': {
            name: 'Galaxy',
            price: 1.80,
            qty: 2
        },
        'slot 11': {
            name: 'Crunchie',
            price: 1.80,
            qty: 3
        },
        'slot 12': {
            name: 'Picnic',
            price: 1.25,
            qty: 2
        },
        'slot 13': {
            name: 'Kit Kat',
            price: 2.00,
            qty: 2
        },
        'slot 14': {
            name: 'Lion Bar',
            price: 1.80,
            qty: 3
        },
        'slot 15': {
            name: 'Oreo',
            price: 2.00,
            qty: 2
        },
        'slot 16': {
            name: 'Toffee Crisp',
            price: 2.00,
            qty: 1
        },
        'slot 17': {
            name: 'Boost',
            price: 1.50,
            qty: 1
        }
    },
    money: {
        '5c': 1,
        '10c': 4,
        '20c': 3,
        '50c': 2,
        '$1': 4,
        '$2': 2
    },
    nominalMapping: {
        '5c': 5,
        '10c': 10,
        '20c': 20,
        '50c': 50,
        '$1': 100,
        '$2': 200
    }
};

const errorMessages = {
    ERROR_OUT_OF_STOCK: 'ERROR_OUT_OF_STOCK',
    ERROR_NOT_PAID: 'ERROR_NOT_PAID',
    ERROR_NO_CHANGE: 'ERROR_NO_CHANGE',
    STATUS_OK: 'OK'
};

let VendingMachine = require('../vendingMachine');
let Messages = require('../messages');
let testMachine = null;

describe('VendingMachine', function () {

    beforeEach(() => {
        testMachine = new VendingMachine(config.products, config.money, config.nominalMapping);
    });

    afterEach(() => {
        testMachine = null;
    });

    it('test - coins validation', () => {
        assert(typeof testMachine.isCoin('$4') == 'undefined');
        assert(typeof testMachine.isCoin('5c') != 'undefined');
    });

    it('test - slot choice validation', () => {
        let slot = testMachine.isSlot('ssdfdsf');
        assert(typeof slot == 'undefined');
    })

    it('test - coins insert', () => {
        assert(testMachine.addUserCoin('5c') > 0);
    })

    it('test - not enough money', () => {
        testMachine.addUserCoin('5c');
        let processSlotResult = testMachine.processSlotSelection('slot 1', new Messages());
        assert(processSlotResult === errorMessages.ERROR_NOT_PAID);
    })

    it('test - not available product', () => {
        testMachine.addUserCoin('5c');
        let processSlotResult = testMachine.processSlotSelection('slot 2', new Messages());
        assert(processSlotResult === errorMessages.ERROR_OUT_OF_STOCK);
    })

    it('test - change returned', () => {
        testMachine.addUserCoin('$2');
        testMachine.addUserCoin('$2');
        let processSlotResult = testMachine.processSlotSelection('slot 6', new Messages());
        assert(processSlotResult === errorMessages.STATUS_OK);
    })
})