const Customer = require('../schema/customerSchema')
const Booking = require('../schema/BookingSchema')

class CustomerController {
   constructor() {
      this.getCustomers = this.getCustomers.bind(this);
   }

   async getCustomers(req, res) {
      const { search, limit = 10, skip = 0, location } = req.query;

      try {
         let bookingQuery = {};

         if (req.location) {
            bookingQuery.location = req.location;
         } else if (location) {
            bookingQuery.location = location;
         }

         const customerIds = await Booking.find(bookingQuery).distinct('customer');

         if (!customerIds.length) {
            return res.status(200).json({
               message: "Customers fetched successfully",
               customers: [],
               totalCustomersCount: 0
            });
         }

         let customerQuery = { _id: { $in: customerIds } };

         if (search) {
            customerQuery.$or = [
               { name: { $regex: search, $options: 'i' } },
               { number: search }
            ];
         }

         const customers = await Customer.find(customerQuery)
            .skip(Number(skip))
            .limit(Number(limit))
            .sort({ createdAt: -1 });

         const totalCustomersCount = await Customer.countDocuments(customerQuery);

         res.status(200).json({ customers, totalCustomersCount });

      } catch (error) {
         console.error(error);
         this.handleError(error, res);
      }
   }

   handleError(error, res) {
      console.error('Error:', error);
      return res.status(error.code === 11000 ? 400 : 500).json({ error: error.message });
   }
}

module.exports = new CustomerController();
