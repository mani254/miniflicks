const Booking = require('../schema/BookingSchema');

class BookingController {
   constructor() {
      this.getBookings = this.getBookings.bind(this);
   }

   // async getBookings(req, res) {
   //    try {
   //       const { search, limit = 10, skip = 0, location, screen, fromDate, toDate } = req.query;
   //       console.log("===================checing================")
   //       console.log(search, 'search')
   //       console.log(limit, 'limit')
   //       console.log(skip, 'skip')
   //       console.log(location, 'location')
   //       console.log(screen, 'screen')
   //       console.log(fromDate, 'fromDate')
   //       console.log(toDate, 'toDate')

   //       let bookingQuery = {};

   //       // Handle location filtering
   //       if (req.location) {
   //          bookingQuery.location = req.location;
   //       } else if (location) {
   //          bookingQuery.location = location;
   //       }

   //       // Handle screen filtering
   //       if (screen) {
   //          bookingQuery.screen = screen;
   //       }

   //       // Initialize search criteria
   //       if (search) {
   //          bookingQuery.$or = [
   //             { 'customer.name': { $regex: search, $options: 'i' } },
   //             { 'customer.number': { $regex: search, $options: 'i' } }
   //          ];
   //       }

   //       if (fromDate || toDate) {
   //          let startDate = fromDate ? new Date(fromDate) : new Date('2024-07-01');
   //          let endDate = toDate ? new Date(toDate) : new Date();
   //          endDate.setDate(endDate.getDate() + 1);
   //          bookingQuery.bookingDate = {
   //             $gte: startDate,
   //             $lt: endDate
   //          };
   //       }

   //       console.log(bookingQuery)

   //       const totalDocuments = await Booking.aggregate([
   //          {
   //             $lookup: {
   //                from: "customers",
   //                localField: "customer",
   //                foreignField: "_id",
   //                as: "customer"
   //             }
   //          },
   //          { $unwind: '$customer' },
   //          {
   //             $lookup: {
   //                from: "locations",
   //                localField: "location",
   //                foreignField: "_id",
   //                as: "location"
   //             }
   //          },
   //          { $unwind: '$location' },
   //          {
   //             $lookup: {
   //                from: "screens",
   //                localField: "screen",
   //                foreignField: "_id",
   //                as: "screen"
   //             }
   //          },
   //          { $unwind: '$screen' },
   //          { $match: bookingQuery },
   //          { $count: "count" } // Count the documents
   //       ]);

   //       const count = totalDocuments.length > 0 ? totalDocuments[0].count : 0;

   //       const bookings = await Booking.aggregate([
   //          {
   //             $lookup: {
   //                from: "customers",
   //                localField: "customer",
   //                foreignField: "_id",
   //                as: "customer"
   //             }
   //          },
   //          { $unwind: '$customer' },
   //          {
   //             $lookup: {
   //                from: "locations",
   //                localField: "location",
   //                foreignField: "_id",
   //                as: "location"
   //             }
   //          },
   //          { $unwind: '$location' },
   //          {
   //             $lookup: {
   //                from: "screens",
   //                localField: "screen",
   //                foreignField: "_id",
   //                as: "screen"
   //             }
   //          },
   //          { $unwind: '$screen' },
   //          { $match: bookingQuery },
   //          { $skip: parseInt(skip) },
   //          { $limit: parseInt(limit) },
   //          {
   //             $addFields: {
   //                location: {
   //                   _id: "$location._id",
   //                   name: "$location.name"
   //                },
   //                screen: {
   //                   _id: "$screen._id",
   //                   name: "$screen.name"
   //                }
   //             }
   //          }
   //       ]);

   //       res.status(200).json({ message: "bookings fetched Succesfully", bookings, count });

   //    } catch (error) {
   //       this.handleError(error, res);
   //    }
   // }
   async getBookings(req, res) {
      try {
         const { location } = req.query;

         let bookingQuery = {};


         if (req.location) {
            bookingQuery.location = req.location;
         } else if (location) {
            bookingQuery.location = location
         }

         console.log(bookingQuery)

         const bookings = await Booking.aggregate([
            {
               $lookup: {
                  from: "locations",
                  localField: "location",
                  foreignField: "_id",
                  as: "location"
               }
            },
            { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
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
                  from: "customers",
                  localField: "customer",
                  foreignField: "_id",
                  as: "customer"
               }
            },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
            // { $match: bookingQuery },
            // {
            //    $addFields: {
            //       location: {
            //          _id: "$location._id",
            //          name: "$location.name"
            //       },
            //       screen: {
            //          _id: "$screen._id",
            //          name: "$screen.name"
            //       }
            //    }
            // }
         ])

         console.log(bookings)

         res.status(200).json({ message: "Bookings fetched successfully", bookings });

      } catch (error) {
         this.handleError(error, res);
      }
   }

   async getBooking(req, res) {
      try {
         const { id } = req.params;

         if (!id) {
            return res.status(400).json({ error: 'Invalid booking ID' });
         }

         const booking = await Booking.findById(id)
            .populate('location', 'name _id')
            .populate('screen', 'name _id')
            .populate('customer', 'name number _id');

         if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
         }

         res.status(200).json({ message: "Fetching successful", booking });

      } catch (error) {
         this.handleError(error, res);
      }
   }

   handleError(error, res) {
      console.error('Error:', error);
      return res.status(error.code === 11000 ? 400 : 500).json({ error: error.message });
   }
};

module.exports = new BookingController();



