const express = require('express')
const cityRouter = express.Router()

const cityController = require('../controllersClass/cityController')
// const { addCity, getCities, deleteCity, updateCity } = require('../controllers/cityController')

// cityRouter.post('/', addCity)
// cityRouter.get('/', getCities)
// cityRouter.delete('/:id', deleteCity)
// cityRouter.put('/:id', updateCity)
cityRouter.post('/', cityController.addCity)
cityRouter.get('/', cityController.getCities)
cityRouter.delete('/:id', cityController.deleteCity)
cityRouter.put('/:id', cityController.updateCity)


module.exports = cityRouter