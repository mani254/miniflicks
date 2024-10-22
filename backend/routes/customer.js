const express = require('express');
const customerRouter = express.Router();
const CustomerController = require('../controllersClass/customerController');

const { authorization } = require('../middleware/authorization')
// customerRouter.post('/', CustomerController.addCustomer);
customerRouter.get('/', authorization, CustomerController.getCustomers);
// customerRouter.delete('/:id', CustomerController.deleteCustomer);
// customerRouter.put('/:id', CustomerController.updateCustomer);

module.exports = customerRouter;
