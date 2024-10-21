const express = require('express')
const cityRouter = express.Router()

const cityController = require('../controllersClass/cityController')

const { authorization, superAdminAuth } = require('../middleware/authorization')

cityRouter.post('/', authorization, cityController.addCity)
cityRouter.get('/', authorization, cityController.getCities)
cityRouter.delete('/:id', superAdminAuth, cityController.deleteCity)
cityRouter.put('/:id', superAdminAuth, cityController.updateCity)


module.exports = cityRouter