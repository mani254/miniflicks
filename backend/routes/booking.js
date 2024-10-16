const bookingRouter = require("express").Router();
const BookingController = require('../controllersClass/bookingController');

const { getBookings, getDashboardInfo, getGraphData } = require('../controllers/bookingController')


bookingRouter.get('/', getBookings)
bookingRouter.get('/getDashboardInfo', getDashboardInfo)
bookingRouter.get('/getGraphData', getGraphData)
bookingRouter.get('/:id', BookingController.getBooking)

module.exports = bookingRouter

