const bookingRouter = require("express").Router();
const BookingController = require('../controllersClass/bookingController');

const getBookings = require('../controllers/bookingController')


bookingRouter.get('/', getBookings)
bookingRouter.get('/:id', BookingController.getBooking)

module.exports = bookingRouter


