const bookingRouter = require("express").Router();
// const BookingController = require('../controllersClass/bookingController');

const { getBookings, getDashboardInfo, getGraphData, createBooking, getBooking, getBookedSlots } = require('../controllersClass/bookingController')

const { authorization } = require('../middleware/authorization')


bookingRouter.get('/', authorization, getBookings)
bookingRouter.get('/getDashboardInfo', authorization, getDashboardInfo)
bookingRouter.get('/getGraphData', getGraphData)
bookingRouter.get('/:id', getBooking)
bookingRouter.post('/getBookedSlots', getBookedSlots)
bookingRouter.post('/', authorization, createBooking)

module.exports = bookingRouter


