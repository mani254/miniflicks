const Booking = require('../schema/BookingSchema')
const mongoose = require('mongoose')
const Location = require('../schema/locationSchema')
const Screen = require('../schema/screenSchema')
const City = require('../schema/citySchema')

async function getBookings(req, res) {
   try {
      const { location, search, fromDate, toDate, limit = 10, page = 1, } = req.query;
      const skip = ((page - 1) * limit)

      let bookingQuery = {};

      if (req.location && mongoose.Types.ObjectId.isValid(req.location)) {
         bookingQuery.location = new mongoose.Types.ObjectId(req.location);
      } else if (location && mongoose.Types.ObjectId.isValid(location)) {
         bookingQuery.location = new mongoose.Types.ObjectId(location);
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
         bookingQuery.bookingDate = {
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
         bookingQuery.bookingDate = {
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
                              { $gte: ["$bookingDate", todayStart] },
                              { $lte: ["$bookingDate", todayEnd] }
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
      const totalCities = await City.countDocuments({ status: true });
      const totalLocations = await Location.countDocuments({ status: true });
      const totalScreens = await Screen.countDocuments({ status: true });

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


module.exports = { getBookings, getDashboardInfo, getGraphData }