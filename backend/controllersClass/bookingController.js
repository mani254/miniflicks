const Booking = require("../schema/bookingSchema");
const mongoose = require("mongoose");
const Location = require("../schema/locationSchema");
const Screen = require("../schema/screenSchema");
const City = require("../schema/citySchema");
const Coupon = require("../schema/couponSchema.js");
const crypto = require("crypto");

require("dotenv").config();

const Razorpay = require("razorpay");
const razorpayInstance = new Razorpay({
   key_id: process.env.RAZORPAY_KEY_ID,
   key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const BookingClass = require("../utils/bookinClass");
const generateBookingHTML = require("../utils/generateInvoice");
const sendMail = require("../utils/sendMail.js");
// const { verify } = require('jsonwebtoken')

async function saveBooking(req, res, status = "pending") {
   const bookingData = req.body;

   if (req.location) {
      if (bookingData.location != req.location)
         return res.status(401).json({ error: "unauthorized to book" });
   }

   const booking = new BookingClass(bookingData);

   await booking.fetchCityAndLocation();
   if (!booking.city || !booking.location) {
      res.status(400).json({ error: "Invalid city or location provided." });
      return null;
   }

   await booking.fetchScreen();
   if (!booking.screen) {
      res.status(400).json({ error: "Invalid screen provided." });
      return null;
   }

   await booking.fetchPackage();
   if (!booking.package) {
      res.status(400).json({ error: "Invalid package selection." });
      return null;
   }

   await booking.slotValidation();

   await booking.fetchOccasion();
   if (!booking.occasion) {
      res.status(400).json({ error: "Select Atlease one Occasion." });
      return null;
   }

   await booking.fetchAddons();
   // if (booking.addons.length !== bookingData.addons.length) {
   //    return res.status(400).json({ error: 'Some selected add-ons are invalid.' });
   // }

   await booking.fetchCakes();
   if (booking?.package.addons.includes("Cake")) {
      if (booking.cakes.length !== bookingData.cakes.length) {
         return res.status(400).json({ error: "Select Atlease one Cake" });
      }
   }

   await booking.fetchGifts();
   // if (booking.gifts.length !== bookingData.gifts.length) {
   //    return res.status(400).json({ error: 'Some selected gifts are invalid.' });
   // }

   await booking.saveCustomer();

   if (!booking.customer) {
      res.status(500).json({ error: "Failed to save customer details." });
      return null;
   }

   await booking.calculateTotalPrice();

   const currentBooking = await booking.saveBooking(status);
   if (currentBooking) {
      return currentBooking;
   } else {
      return null;
   }
}

async function getBookings(req, res) {
   try {
      const {
         location,
         search,
         fromDate,
         toDate,
         limit = 10,
         page = 1,
      } = req.query;
      const skip = (page - 1) * limit;

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
            { "customer.name": { $regex: search, $options: "i" } },
            { "customer.number": { $regex: search, $options: "i" } },
         ];
      }


      if (fromDate || toDate) {
         const startDate = fromDate ? new Date(fromDate) : new Date("1970-01-01");
         if (toDate) {
            const endDate = new Date(toDate)
            endDate.setHours(23, 59, 59, 999);
            bookingQuery.date = {
               $gte: startDate,
               $lte: endDate,
            }
         }
         else {
            bookingQuery.date = {
               $gte: startDate
            }
         }
      }

      const totalDocuments = await Booking.aggregate([
         {
            $lookup: {
               from: "customers",
               localField: "customer",
               foreignField: "_id",
               as: "customer",
            },
         },
         { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
         { $match: bookingQuery },
         { $count: "count" },
      ]);

      const bookings = await Booking.aggregate([
         {
            $lookup: {
               from: "customers",
               localField: "customer",
               foreignField: "_id",
               as: "customer",
            },
         },
         { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
         {
            $match: {
               ...bookingQuery,
               status: { $in: ["booked", "pending"] }
            }
         },
         {
            $lookup: {
               from: "screens",
               localField: "screen",
               foreignField: "_id",
               as: "screen",
            },
         },
         { $unwind: { path: "$screen", preserveNullAndEmptyArrays: true } },

         {
            $lookup: {
               from: "locations",
               localField: "location",
               foreignField: "_id",
               as: "location",
            },
         },
         { $unwind: { path: "$location", preserveNullAndEmptyArrays: true } },
         { $sort: { date: -1 } },
         { $skip: parseInt(skip) },
         { $limit: parseInt(limit) },
         {
            $addFields: {
               location: {
                  _id: "$location._id",
                  name: "$location.name",
               },
               screen: {
                  _id: "$screen._id",
                  name: "$screen.name",
               },
            },
         },
      ]);

      res
         .status(200)
         .json({
            message: "Bookings fetched successfully",
            bookings,
            totalDocuments: totalDocuments[0]?.count ? totalDocuments[0].count : 0,
         });
   } catch (error) {
      console.error("Error:", error);
      return res
         .status(error.code === 11000 ? 400 : 500)
         .json({ error: error.message });
   }
}
async function getDashboardInfo(req, res) {
   try {
      const { location, fromDate, toDate, status = "" } = req.query;
      // console.log(req.query, 'req.query')

      let bookingQuery = {};

      if (req.location && mongoose.Types.ObjectId.isValid(req.location)) {
         bookingQuery.location = new mongoose.Types.ObjectId(req.location);
      } else if (location && mongoose.Types.ObjectId.isValid(location)) {
         bookingQuery.location = new mongoose.Types.ObjectId(location);
      }

      if (fromDate || toDate) {
         const startDate = fromDate ? new Date(fromDate) : new Date("1970-01-01");
         const endDate = toDate ? new Date(toDate) : new Date();
         endDate.setHours(23, 59, 59, 999);
         bookingQuery.date = {
            $gte: startDate,
            $lt: endDate,
         };
      }

      if (status.length > 0) {
         bookingQuery.status = status
      }

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
                              { $lte: ["$date", todayEnd] },
                           ],
                        },
                        1,
                        0,
                     ],
                  },
               },
               pendingAmount: { $sum: "$remainingAmount" },
            },
         },
      ]);

      // console.log(totals)
      let totalCities = null;
      let totalLocations = null;
      let totalScreens = 0;

      if (req.superAdmin) {
         totalCities = await City.countDocuments({ status: true });
         totalLocations = await Location.countDocuments({ status: true });
         totalScreens = await Screen.countDocuments({ status: true });
      } else {
         totalScreens = await Screen.countDocuments({
            location: req.location,
            status: true,
         });
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
            totalCities,
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
         totalCities,
      });
   } catch (error) {
      console.error("Error:", error);
      return res
         .status(error.code === 11000 ? 400 : 500)
         .json({ error: error.message });
   }
}
async function getGraphData(req, res) {
   try {
      const locations = await Location.find({});

      if (!locations.length) {
         return res.status(200).json([]);
      }

      // Calculate the total income for each Location
      const locationAmounts = await Promise.all(
         locations.map(async (location) => {
            const bookings = await Booking.find({ location: location._id });
            const totalAmount = bookings.reduce(
               (sum, booking) => sum + booking.totalPrice,
               0
            );
            return {
               location: location.name,
               totalAmount,
            };
         })
      );

      // Calculate the overall total amount
      const overallTotalAmount = locationAmounts.reduce(
         (sum, loc) => sum + loc.totalAmount,
         0
      );

      const locationPercentages = locationAmounts.map((loc) => {
         const percentage = overallTotalAmount
            ? (loc.totalAmount / overallTotalAmount) * 100
            : 0;
         return {
            location: loc.location,
            totalAmount: loc.totalAmount,
            percentage: parseFloat(percentage.toFixed(2)),
         };
      });
      res.status(200).json(locationPercentages);
   } catch (error) {
      console.error("Error:", error);
      return res
         .status(error.code === 11000 ? 400 : 500)
         .json({ error: error.message });
   }
}

async function getBooking(req, res) {
   try {
      const { id } = req.params;

      const bookedData = await Booking.findById(id)
         .populate("customer")
         .populate({ path: "location", select: "name _id" })
         .populate({
            path: "screen",
            select: "name _id minPeople extraPersonPrice",
         });
      if (bookedData) {
         return res
            .status(200)
            .json({ message: "Successfully fetched booking", booking: bookedData });
      } else {
         return res.status(500).json({ error: "Failed to save booking data." });
      }
   } catch (error) {
      console.error("Error:", error);
      const statusCode = error.code === 11000 ? 400 : 500;
      return res
         .status(statusCode)
         .json({ error: error.message || "An unknown error occurred." });
   }
}

// async function getBookedSlots(req, res) {
//    try {
//       const { currentDate, screenId } = req.body;
//       if (!currentDate, !screenId) {
//          return res.status(200).json([]);
//       }

//       let date = new Date(currentDate);
//       date.setHours(0, 0, 0, 0);

//       const bookings = await Booking.find({ date, screen: screenId, status: { $ne: 'canceled' } });
//       const bookedSlots = bookings.map((booking) => booking.slot);

//       return res.status(200).json(bookedSlots);
//    } catch (error) {
//       console.error('Error:', error);
//       return res.status(500).json({ error: error.message || 'An unknown error occurred' });
//    }
// }

async function getBookedSlots(req, res) {
   try {
      const { currentDate, screenId } = req.body;
      if (!currentDate || !screenId) {
         return res.status(200).json([]);
      }

      let date = new Date(currentDate);
      date.setHours(0, 0, 0, 0);

      // console.log(date, '------')

      const bookings = await Booking.find({
         date,
         screen: screenId,
         status: { $in: ["pending", "booked"] },
      });
      const bookedSlots = bookings.map((booking) => booking.slot);

      return res.status(200).json(bookedSlots);
   } catch (error) {
      console.error("Error:", error);
      return res
         .status(500)
         .json({ error: error.message || "An unknown error occurred" });
   }
}

async function createAdminBooking(req, res) {
   try {
      const currentBooking = await saveBooking(req, res, "booked");

      // console.log(currentBooking, 'booking Details after saving the booking')

      const bookedData = await Booking.findById(currentBooking._id)
         .populate({ path: "location", select: "name _id addressLink" })
         .populate({
            path: "screen",
            select: "name _id minPeople extraPersonPrice",
         })
         .populate({ path: "customer", select: "name email number" });

      // console.log("-------------------------------------------------------------")
      // console.log(bookedData, 'booked Data after fetching the saved booking')

      if (bookedData) {
         const html = await generateBookingHTML(bookedData);
         sendMail({
            to: [bookedData.customer.email],
            subject: `Miniflicks Theater Booking Confirmation for ${bookedData?.customer?.name || ""}`,
            html,
         });
         return res
            .status(200)
            .json({ message: "Booking successful", booking: bookedData });
      } else {
         return res.status(500).json({ error: "Failed to save booking data." });
      }
   } catch (error) {
      console.error("Error:", error);
      const statusCode = error.code === 11000 ? 400 : 500;
      return res
         .status(statusCode)
         .json({ error: error.message || "An unknown error occurred." });
   }
}

async function updateAdminBooking(req, res) {
   try {
      const booking = req.body;

      // Retrieve the current booking details
      const currentBooking = await Booking.findOne({ _id: booking.id }).populate('screen');

      if (!currentBooking) {
         return res.status(404).json({ status: "error", message: "Booking not found." });
      }

      // Map addons, gifts, and cakes
      const addons = booking.addons.map(addon => ({
         _id: addon._id,
         name: addon.name,
         price: addon.price,
         count: addon.count,
      }));

      const gifts = booking.gifts.map(gift => ({
         _id: gift._id,
         name: gift.name,
         price: gift.price,
         count: gift.count,
      }));

      const cakes = booking.cakes.map(cake => ({
         _id: cake._id,
         name: cake.name,
         price: cake.price,
         free: cake.free,
      }));

      const addonsPrice = addons.length == 0 ? 0 : addons.reduce((sum, addon) => sum + addon.price * addon.count, 0);
      const giftsPrice = gifts.length == 0 ? 0 : gifts.reduce((sum, gift) => sum + gift.price * gift.count, 0);
      const cakesPrice = cakes.length == 0 ? 0 : cakes.reduce((sum, cake) => sum + cake.price, 0);
      const packagePrice = booking.package.price || 0;
      const occasionPrice = booking.occasion.price || 0;
      const extraPersonsPrice = booking.otherInfo.numberOfExtraPeople * currentBooking.screen.extraPersonPrice

      // console.log(addonsPrice, 'addons Price')
      // console.log(giftsPrice, 'gifts Price')
      // console.log(cakesPrice, 'cakesPrice')
      // console.log(packagePrice, 'package Price')
      // console.log(occasionPrice, 'occasion Price')
      // console.log(extraPersonsPrice, 'extraPersonPrice')

      let couponCode = currentBooking.couponCode || null
      let couponPrice = currentBooking.couponPrice || 0;
      let total = addonsPrice + giftsPrice + cakesPrice + packagePrice + occasionPrice + extraPersonsPrice;

      // console.log(total, 'total')

      // Handle coupon changes
      if (currentBooking.couponCode !== booking.otherInfo.couponCode) {
         couponCode = booking.otherInfo.couponCode
         if (booking.otherInfo.couponCode) {
            const coupon = await Coupon.findOne({ code: booking.otherInfo.couponCode.toUpperCase() });

            if (!coupon) {
               return res.status(400).json({ status: "error", message: "Invalid coupon code." });
            }

            if (coupon.type === "fixed") {
               couponPrice = -coupon.discount;
            } else {
               couponPrice = -parseFloat(((coupon.discount / 100) * total).toFixed(2));
            }
         } else {
            couponPrice = currentBooking.couponPrice;
            couponCode = currentBooking.couponCode
         }
      }
      else {
         couponCode = currentBooking.couponCode
         couponPrice = currentBooking.couponPrice
      }

      // Calculate remaining amount and prepare the updated booking object
      const updatedBooking = {
         city: booking.city,
         location: booking.location,
         screen: booking.screen,
         date: booking.date,
         slot: booking.slot,
         package: booking.package,
         occasion: { _id: booking.occasion._id, name: booking.occasion.name, price: booking.occasion.price },
         addons: addons.length > 0 ? addons : [],
         gifts: gifts.length > 0 ? gifts : [],
         cakes: cakes.length > 0 ? cakes : [],
         numberOfPeople: booking.otherInfo.numberOfPeople || 0,
         nameOnCake: booking.otherInfo.nameOnCake || "",
         ledName: booking.otherInfo.ledName || "",
         ledNumber: booking.otherInfo.ledNumber || "",
         note: booking.note || "",
         status: 'booked',
         advancePrice: booking.advance,
         totalPrice: total + couponPrice,
         couponCode: couponCode,
         couponPrice: couponPrice,
         remainingAmount: booking.fullPayment ? 0 : parseFloat((total + couponPrice) - booking.advance).toFixed(2),
      };

      // Update the booking in the database
      const bookedData = await Booking.updateOne({ _id: booking.id }, updatedBooking);

      return res.status(200).json({ status: "success", message: "Booking updated successfully.", booking: bookedData });
   } catch (error) {
      console.error('Error:', error);
      const statusCode = error.code === 11000 ? 400 : 500;
      return res.status(statusCode).json({ status: "error", message: error.message || 'An unknown error occurred.' });
   }
}


const updateBookingStatus = async (bookingId) => {
   try {
      const booking = await Booking.findById(bookingId);

      if (!booking) return;

      if (booking.status === "pending") {
         booking.status = "canceled";
         await booking.save();
      }
   } catch (error) {
      console.error("Error updating booking status:", error);
   }
};

const cancelPayment = async (req, res) => {
   const { orderId, reason } = req.body;

   if (!orderId || !reason) {
      return res.status(400).json({ error: "Order ID and reason are required." });
   }

   try {
      const booking = await Booking.findOne({ razorpayOrderId: orderId });
      if (!booking) {
         return res.status(404).json({ error: "Booking not found." });
      }

      booking.status = "canceled";
      booking.cancellationReason = reason;
      await booking.save();

      return res.status(200).json({ message: "Payment canceled successfully." });
   } catch (error) {
      console.error("Error canceling payment:", error);
      return res.status(500).json({ error: "Failed to cancel payment." });
   }
};

async function createCustomerBooking(req, res) {
   try {
      // Step 1: Save the booking with a "pending" status
      const currentBooking = await saveBooking(req, res, "pending");

      if (!currentBooking) return;

      // Step 2: Ensure that the price is correctly calculated
      if (currentBooking.totalPrice <= 0) {
         return res
            .status(400)
            .json({ error: "Total price for the booking is invalid." });
      }

      // Step 3: Create Razorpay order with additional checks for currency, amount, etc.
      const razorpayOrderOptions = {
         amount: currentBooking.totalPrice * 100,
         currency: "INR",
         receipt: `order_rcptid_${currentBooking._id}`,
         partial_payment: true,
         first_payment_min_amount: 999 * 100,
         notes: {
            customer_id: currentBooking.customer,
            booking_id: currentBooking._id,
         },
      };

      // Step 4: Create the order in Razorpay
      const razorpayOrder = await razorpayInstance.orders.create(
         razorpayOrderOptions
      );

      // Step 5: Handle order creation failure
      if (!razorpayOrder || !razorpayOrder.id) {
         return res
            .status(500)
            .json({ error: "Failed to create Razorpay order." });
      }

      // Step 6: Save the Razorpay order ID in the current booking
      const bookedData = await currentBooking.updateOne({
         razorpayOrderId: razorpayOrder.id,
      });

      // Step 7: Start the timer to automatically cancel the booking after 10 minutes
      setTimeout(() => {
         updateBookingStatus(currentBooking._id);
      }, 10 * 60 * 1000);

      // Step 8: Return the booking details along with Razorpay order ID
      if (bookedData) {
         return res.status(200).json({
            message: "Booking successful, proceed to payment.",
            booking: bookedData,
            razorpayOrderId: razorpayOrder.id,
         });
      } else {
         return res
            .status(500)
            .json({ error: "Failed to retrieve complete booking data." });
      }
   } catch (error) {
      console.error("Error:", error);
      const statusCode = error.code === 11000 ? 400 : 500;
      return res
         .status(statusCode)
         .json({ error: error.message || "An unknown error occurred." });
   }
}

async function delPreviousOrder(req, res) {
   const { orderId } = req.body;

   if (!orderId) {
      return res.status(400).json({ error: "Invalid orderId" });
   }

   try {
      const booking = await Booking.findOneAndDelete({
         razorpayOrderId: orderId,
         status: "pending",
      });

      if (!booking) {
         return res.status(404).json({ error: "Booking not found." });
      }

      return res
         .status(200)
         .json({ message: "Previous order deleted successfully." });
   } catch (error) {
      console.error("Error canceling payment:", error);
      return res.status(500).json({ error: "Failed to cancel payment." });
   }
}

async function verifyPayment(req, res) {
   const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

   const order = await razorpayInstance.orders.fetch(razorpay_order_id);

   const body = razorpay_order_id + "|" + razorpay_payment_id;
   const generated_signature = crypto
      .createHmac("sha256", razorpayInstance.key_secret)
      .update(body)
      .digest("hex");

   if (generated_signature === razorpay_signature) {
      // Payment is valid, proceed with booking status update
      try {
         // Update booking status to 'paid' or 'completed'
         const booking = await Booking.findOne({
            razorpayOrderId: razorpay_order_id,
         });
         if (!booking) {
            return res.status(404).json({ error: "Booking Not Found" });
         }

         booking.status = "booked";
         booking.razorpayPaymentId = razorpay_payment_id;
         booking.advancePrice = order.amount_paid / 100;
         booking.remainingAmount = booking.totalPrice - order.amount_paid / 100;

         await booking.save();

         const populatedBooking = await Booking.findById(booking._id)
            .populate({ path: "location", select: "name _id addressLink" })
            .populate({
               path: "screen",
               select: "name _id minPeople extraPersonPrice",
            })
            .populate({ path: "customer", select: "name email number" });

         const html = await generateBookingHTML(populatedBooking);
         sendMail({
            to: [populatedBooking.customer.email, 'miniflicksprivatetheatres@gmail.com'],
            subject: `Miniflicks Theater Booking Confirmation for ${populatedBooking?.customer?.name || ""}`,
            html,
         });

         return res.status(200).json({
            success: true,
            message: "Payment verified and email sent",
            booking: populatedBooking,
         });
      } catch (error) {
         console.error("Error updating booking status", error);
         return res
            .status(500)
            .json({ success: false, error: "Failed to update booking status" });
      }
   } else {
      return res
         .status(400)
         .json({ success: false, message: "Payment verification failed" });
   }
}

async function yesterdayBookingCustomers(req, res) {
   const today = new Date();

   const yesterdayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 1
   );
   yesterdayStart.setHours(0, 0, 0, 0);

   const yesterdayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 1
   );
   yesterdayEnd.setHours(23, 59, 59, 999);

   try {
      const bookings = await Booking.find(
         { date: { $gte: yesterdayStart, $lte: yesterdayEnd } },
         "_id"
      ).populate("customer");

      const customers = [
         ...new Set(bookings.map((booking) => booking.customer.email)),
      ];
      return customers;
   } catch (error) {
      console.error(error);
   }
}

async function bookingsFrom360DaysAgo() {
   const today = new Date();

   const startOf360DaysAgo = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 360
   );
   startOf360DaysAgo.setHours(0, 0, 0, 0);

   const endOf360DaysAgo = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 360
   );
   endOf360DaysAgo.setHours(23, 59, 59, 999);

   try {
      const bookings = await Booking.find(
         { date: { $gte: startOf360DaysAgo, $lte: endOf360DaysAgo } },
         "_id"
      ).populate("customer");

      const bookingList = bookings.map((booking) => ({
         customer: booking.customer.email,
         date: booking.date,
      }));

      return bookingList;
   } catch (error) {
      console.error("Error fetching bookings:", error);
      throw new Error("Failed to fetch bookings");
   }
}

async function deleteBooking(req, res) {
   try {
      const { id } = req.params;

      if (!id) {
         return res.status(400).json({ error: 'Booking ID is required' });
      }

      const deletedBooking = await Booking.findByIdAndDelete(id);

      if (!deletedBooking) {
         return res.status(404).json({ error: 'Booking not found' });
      }

      res.status(200).json({ message: 'Booking deleted successfully', booking: deletedBooking });
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
   }
}


module.exports = {
   getBookings,
   getDashboardInfo,
   getGraphData,
   createAdminBooking,
   getBooking,
   getBookedSlots,
   yesterdayBookingCustomers,
   createCustomerBooking,
   verifyPayment,
   bookingsFrom360DaysAgo,
   cancelPayment,
   delPreviousOrder,
   updateAdminBooking,
   deleteBooking,
};
