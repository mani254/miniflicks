const Booking = require('../schema/BookingSchema')
const mongoose = require('mongoose')

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


module.exports = getBookings