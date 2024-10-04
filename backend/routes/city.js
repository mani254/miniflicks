const express = require('express')
const cityRouter = express.Router()

const { addCity, getCities, deleteCity, updateCity } = require('../controllers/cityController')

cityRouter.post('/', addCity)
cityRouter.get('/', getCities)
cityRouter.delete('/:id', deleteCity)
cityRouter.put('/:id', updateCity)


module.exports = cityRouter