const bookingRouter = require("express").Router();
// const BookingController = require('../controllersClass/bookingController');

const { getBookings, getDashboardInfo, getGraphData, createAdminBooking, getBooking, getBookedSlots, createCustomerBooking, verifyPayment, cancelPayment, delPreviousOrder,updateAdminBooking } = require('../controllersClass/bookingController')

const { authorization } = require('../middleware/authorization')


bookingRouter.get('/', authorization, getBookings)
bookingRouter.get('/getDashboardInfo', authorization, getDashboardInfo)
bookingRouter.get('/getGraphData', getGraphData)
bookingRouter.get('/:id', getBooking)
bookingRouter.post('/getBookedSlots', getBookedSlots)
bookingRouter.post('/', authorization, createAdminBooking)
bookingRouter.put('/', authorization, updateAdminBooking)
bookingRouter.post('/customerBooking', createCustomerBooking)
bookingRouter.post('/verifyPayment', verifyPayment)
bookingRouter.post('/cancelPayment', cancelPayment)
bookingRouter.post('/delPreviousOrder', delPreviousOrder)

module.exports = bookingRouter


