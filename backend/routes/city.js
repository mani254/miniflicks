const express = require('express')
const cityRouter = express.Router()

const cityController = require('../controllersClass/cityController')

const { superAdminAuth, userAuth } = require('../middleware/authorization')

cityRouter.post('/', superAdminAuth, cityController.addCity)
cityRouter.get('/', userAuth, cityController.getCities)
cityRouter.delete('/:id', superAdminAuth, cityController.deleteCity)
cityRouter.put('/:id', superAdminAuth, cityController.updateCity)


module.exports = cityRouter