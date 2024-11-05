const Customer = require('../schema/customerSchema')
const Booking = require('../schema/bookingSchema')

class CustomerController {
   constructor() {
      this.getCustomers = this.getCustomers.bind(this);
   }

   async getCustomers(req, res) {
      const { search, limit = 10, page = 1, location } = req.query;
      const skip = ((page - 1) * limit)

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
            customerQuery.$or = [];
            customerQuery.$or.push({ name: { $regex: search, $options: 'i' } });
            customerQuery.$or.push({ number: { $regex: search, $options: 'i' } });
         }

         const customers = await Customer.find(customerQuery)
            .skip(Number(skip))
            .limit(Number(limit))
            .sort({ createdAt: -1 });

         const totalDocuments = await Customer.countDocuments(customerQuery);


         res.status(200).json({ customers, totalDocuments });

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
