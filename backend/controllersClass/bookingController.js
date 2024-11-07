const Booking = require('../schema/bookingSchema')
const mongoose = require('mongoose')
const Location = require('../schema/locationSchema')
const Screen = require('../schema/screenSchema')
const City = require('../schema/citySchema')

const BookingClass = require('../utils/bookinClass')
const generateBookingHTML = require('../utils/generateInvoice')
const sendMail = require('../utils/sendMail')

async function getBookings(req, res) {
   try {
      const { location, search, fromDate, toDate, limit = 10, page = 1 } = req.query;
      const skip = ((page - 1) * limit)

      let bookingQuery = {};

      if (req.location && mongoose.Types.ObjectId.isValid(req.location)) {
         bookingQuery.location = new mongoose.Types.ObjectId(req.location);
         // bookingQuery.location = req.location;
      } else if (location && mongoose.Types.ObjectId.isValid(location)) {
         bookingQuery.location = new mongoose.Types.ObjectId(location);
         // bookingQuery.location = location;
      }

      if (search) {
         bookingQuery.$or = [
            { 'customer.name': { $regex: search, $options: 'i' } },
            { 'customer.number': { $regex: search, $options: 'i' } }
         ];
      }

      if (fromDate || toDate) {
         const startDate = fromDate ? new Date(fromDate) : new Date('1970-01-01');
         const endDate = toDate ? new Date(toDate) : new Date();
         endDate.setHours(23, 59, 59, 999);
         bookingQuery.date = {
            $gte: startDate,
            $lt: endDate
         };
      }

      const totalDocuments = await Booking.aggregate([
         {
            $lookup: {
               from: "customers",
               localField: "customer",
               foreignField: "_id",
               as: "customer"
            }
         },
         { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
         { $match: bookingQuery },
         { $count: "count" }
      ])


      const bookings = await Booking.aggregate([
         {
            $lookup: {
               from: "customers",
               localField: "customer",
               foreignField: "_id",
               as: "customer"
            }
         },
         { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
         { $match: bookingQuery },
         {
            $lookup: {
               from: "screens",
               localField: "screen",
               foreignField: "_id",
               as: "screen"
            }
         },
         { $unwind: { path: '$screen', preserveNullAndEmptyArrays: true } },

         {
            $lookup: {
               from: "locations",
               localField: "location",
               foreignField: "_id",
               as: "location"
            }
         },
         { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
         { $skip: parseInt(skip) },
         { $limit: parseInt(limit) },
         { $sort: { bookingDate: 1 } },
         {
            $addFields: {
               location: {
                  _id: "$location._id",
                  name: "$location.name"
               },
               screen: {
                  _id: "$screen._id",
                  name: "$screen.name"
               }
            }
         },
      ]);

      res.status(200).json({ message: "Bookings fetched successfully", bookings, totalDocuments: totalDocuments[0]?.count ? totalDocuments[0].count : 0 });
   } catch (error) {
      console.error('Error:', error);
      return res.status(error.code === 11000 ? 400 : 500).json({ error: error.message });
   }
}
async function getDashboardInfo(req, res) {
   try {
      const { location, fromDate, toDate } = req.query;
      // console.log(req.query, 'req.query')

      let bookingQuery = {};

      if (req.location && mongoose.Types.ObjectId.isValid(req.location)) {
         bookingQuery.location = new mongoose.Types.ObjectId(req.location);
      } else if (location && mongoose.Types.ObjectId.isValid(location)) {
         bookingQuery.location = new mongoose.Types.ObjectId(location);
      }


      if (fromDate || toDate) {
         const startDate = fromDate ? new Date(fromDate) : new Date('1970-01-01');
         const endDate = toDate ? new Date(toDate) : new Date();
         endDate.setHours(23, 59, 59, 999);
         bookingQuery.date = {
            $gte: startDate,
            $lt: endDate
         };
      }
      // console.log(bookingQuery, 'booking Query')

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);


      const [totals] = await Booking.aggregate([
         { $match: bookingQuery },
         {
            $group: {
               _id: null,
               totalIncome: { $sum: "$totalPrice" },
               totalBookings: { $sum: 1 },
               todayBookings: {
                  $sum: {
                     $cond: [
                        {
                           $and: [
                              { $gte: ["$date", todayStart] },
                              { $lte: ["$date", todayEnd] }
                           ]
                        },
                        1,
                        0
                     ]
                  }
               },
               pendingAmount: { $sum: "$remainingAmount" }
            }
         }
      ]);

      // console.log(totals)
      let totalCities = null
      let totalLocations = null
      let totalScreens = 0

      if (req.superAdmin) {
         totalCities = await City.countDocuments({ status: true });
         totalLocations = await Location.countDocuments({ status: true });
         totalScreens = await Screen.countDocuments({ status: true });
      }
      else {
         totalScreens = await Screen.countDocuments({ location: req.location, status: true })
      }


      if (!totals) {
         return res.status(200).json({
            message: "No bookings found",
            totalIncome: 0,
            totalBookings: 0,
            todayBookings: 0,
            pendingAmount: 0,
            totalLocations,
            totalScreens,
            totalCities
         });
      }

      res.status(200).json({
         message: "Bookings fetched successfully",
         totalIncome: totals.totalIncome || 0,
         totalBookings: totals.totalBookings || 0,
         todayBookings: totals.todayBookings || 0,
         pendingAmount: totals.pendingAmount || 0,
         totalLocations,
         totalScreens,
         totalCities
      });

   } catch (error) {
      console.error('Error:', error);
      return res.status(error.code === 11000 ? 400 : 500).json({ error: error.message });
   }
}
async function getGraphData(req, res) {
   try {

      const locations = await Location.find({})

      if (!locations.length) {
         return res.status(200).json([]);
      }

      // Calculate the total income for each Location
      const locationAmounts = await Promise.all(locations.map(async (location) => {
         const bookings = await Booking.find({ location: location._id });
         const totalAmount = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
         return {
            location: location.name,
            totalAmount,
         };
      }));

      // Calculate the overall total amount
      const overallTotalAmount = locationAmounts.reduce((sum, loc) => sum + loc.totalAmount, 0);


      const locationPercentages = locationAmounts.map(loc => {
         const percentage = overallTotalAmount ? (loc.totalAmount / overallTotalAmount) * 100 : 0;
         return {
            location: loc.location,
            totalAmount: loc.totalAmount,
            percentage: parseFloat(percentage.toFixed(2)),
         };
      });
      res.status(200).json(locationPercentages);

   } catch (error) {
      console.error('Error:', error);
      return res.status(error.code === 11000 ? 400 : 500).json({ error: error.message });
   }
}

async function createBooking(req, res) {
   try {
      const bookingData = req.body;

      if (req.location) {
         if (bookingData.location != req.location) return res.status(401).json({ error: 'unauthorized to book' })
      }


      const booking = new BookingClass(bookingData);

      await booking.fetchCityAndLocation();
      if (!booking.city || !booking.location) {
         return res.status(400).json({ error: 'Invalid city or location provided.' });
      }

      await booking.fetchScreen();
      if (!booking.screen) {
         return res.status(400).json({ error: 'Invalid screen provided.' });
      }

      await booking.fetchPackage();
      if (!booking.package) {
         return res.status(400).json({ error: 'Invalid package selection.' });
      }

      await booking.slotValidation()

      await booking.fetchOccasion();
      if (!booking.occasion) {
         return res.status(400).json({ error: 'Invalid occasion selection.' });
      }

      await booking.fetchAddons();
      if (booking.addons.length !== bookingData.addons.length) {
         return res.status(400).json({ error: 'Some selected add-ons are invalid.' });
      }

      await booking.fetchCakes();
      if (booking.cakes.length !== bookingData.cakes.length) {
         return res.status(400).json({ error: 'Some selected cakes are invalid.' });
      }

      await booking.fetchGifts();
      if (booking.gifts.length !== bookingData.gifts.length) {
         return res.status(400).json({ error: 'Some selected gifts are invalid.' });
      }

      await booking.saveCustomer();

      if (!booking.customer) {
         return res.status(500).json({ error: 'Failed to save customer details.' });
      }

      booking.calculateTotalPrice();
      const currentBooking = await booking.saveBooking();
      const bookedData = await Booking.findById(currentBooking._id).populate({ path: 'location', select: 'name _id addressLink' }).populate({ path: 'screen', select: 'name _id minPeople extraPersonPrice', });

      if (bookedData) {
         const html = generateBookingHTML(bookedData)
         sendMail({ to: booking.customer.email, subject: 'Miniflicks Theator Booking Confirmation', html });
         return res.status(200).json({ message: 'Booking successful', booking: bookedData });
      } else {
         return res.status(500).json({ error: 'Failed to save booking data.' });
      }

   } catch (error) {
      console.error('Error:', error);
      const statusCode = error.code === 11000 ? 400 : 500;
      return res.status(statusCode).json({ error: error.message || 'An unknown error occurred.' });
   }
}

async function getBooking(req, res) {
   try {
      const { id } = req.params;

      const bookedData = await Booking.findById(id).populate({ path: 'location', select: 'name _id' }).populate({ path: 'screen', select: 'name _id minPeople extraPersonPrice', });
      if (bookedData) {
         return res.status(200).json({ message: 'Successfully fetched booking', booking: bookedData });
      } else {
         return res.status(500).json({ error: 'Failed to save booking data.' });
      }
   } catch (error) {
      console.error('Error:', error);
      const statusCode = error.code === 11000 ? 400 : 500;
      return res.status(statusCode).json({ error: error.message || 'An unknown error occurred.' });
   }
}

async function getBookedSlots(req, res) {
   try {
      const { currentDate, screenId } = req.body;
      if (!currentDate, !screenId) {
         return res.status(200).json([]);
      }

      let date = new Date(currentDate);
      date.setHours(0, 0, 0, 0);

      const bookings = await Booking.find({ date, screen: screenId, status: { $ne: 'confirmed' } });
      const bookedSlots = bookings.map((booking) => booking.slot);

      return res.status(200).json(bookedSlots);
   } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: error.message || 'An unknown error occurred' });
   }
}

async function yesterdayBookingCustomers(req, res) {
   const today = new Date();

   const yesterdayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
   yesterdayStart.setHours(0, 0, 0, 0);

   const yesterdayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
   yesterdayEnd.setHours(23, 59, 59, 999);

   try {

      const bookings = await Booking.find(
         { date: { $gte: yesterdayStart, $lte: yesterdayEnd } },
         "_id"
      ).populate('customer');

      const customers = [...new Set(bookings.map((booking) => booking.customer.email))];
      return customers;
   } catch (error) {
      console.error(error);
   }
}



module.exports = { getBookings, getDashboardInfo, getGraphData, createBooking, getBooking, getBookedSlots, yesterdayBookingCustomers }