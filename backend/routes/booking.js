const bookingRouter = require("express").Router();
const BookingController = require('../controllersClass/bookingController');


bookingRouter.get('/', BookingController.getBookings)
bookingRouter.get('/:id', BookingController.getBooking)

module.exports = bookingRouter


