const express = require('express');
const customerRouter = express.Router();
const CustomerController = require('../controllersClass/customerController');


// customerRouter.post('/', CustomerController.addCustomer);
customerRouter.get('/', CustomerController.getCustomers);
// customerRouter.delete('/:id', CustomerController.deleteCustomer);
// customerRouter.put('/:id', CustomerController.updateCustomer);

module.exports = customerRouter;
