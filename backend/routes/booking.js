const bookingRouter = require("express").Router();
// const BookingController = require('../controllersClass/bookingController');

const { getBookings, getDashboardInfo, getGraphData, createBooking } = require('../controllersClass/bookingController')

const { authorization } = require('../middleware/authorization')


bookingRouter.get('/', authorization, getBookings)
bookingRouter.get('/getDashboardInfo', authorization, getDashboardInfo)
bookingRouter.get('/getGraphData', getGraphData)
bookingRouter.post('/', createBooking)
// bookingRouter.get('/:id', BookingController.getBooking)

module.exports = bookingRouter


