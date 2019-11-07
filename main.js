let config = require('./config.json');
let ConsoleProcessor = require('./consoleProcessor');
let VendingMachine = require('./vendingMachine');

let vendingMachine = new VendingMachine(config.products, config.money, config.userPaid, config.nominalMapping);
let consoleProcessor = new ConsoleProcessor();

consoleProcessor.displayWelcomeMessage(vendingMachine.productsStore);
//vendingMachine.displayWelcomeMsg();

