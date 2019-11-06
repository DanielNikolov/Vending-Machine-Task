let config = require('./config.json');
var VendingMachine = require('./vendingMachine');

var vendingMachine = new VendingMachine(config.products, config.money, config.userPaid, config.nominalMapping);
vendingMachine.displayWelcomeMsg();