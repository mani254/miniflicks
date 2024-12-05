const City = require('../schema/citySchema');
const Location = require('../schema/locationSchema')
const Screen = require('../schema/screenSchema')
const Occasion = require('../schema/occasionSchema')
const Addon = require('../schema/addonSchema')
const Cake = require("../schema/cakeSchema")
const Gift = require('../schema/giftSchema')
const Customer = require('../schema/customerSchema')
const Booking = require('../schema/bookingSchema');
const Coupon = require('../schema/couponSchema')

class BookingClass {
   constructor(bookingData) {
      this.bookingData = bookingData;
      this.city = null;
      this.location = null;
      this.screen = null;
      this.date = new Date(bookingData.date)
      this.slot = bookingData.slot
      this.package = null;
      this.occasion = null;
      this.addons = [];
      this.gifts = [];
      this.cakes = [];
      this.customer = null;
      this.date.setHours(0, 0, 0, 0)
      this.numberOfPeople = bookingData.otherInfo.numberOfPeople || 0;
      this.nameOnCake = bookingData.otherInfo.nameOnCake || "";
      this.ledName = bookingData.otherInfo.ledName || "";
      this.ledNumber = bookingData.otherInfo.ledNumber || "";
      this.note = bookingData.note || '';
      // this.status = 'pending';
      this.couponPrice= 0
      this.couponCode = bookingData.otherInfo.couponCode || null
      this.totalPrice = 0;
      this.remainingAmount = 0;
      this.advancePrice = bookingData.advance || 999
   }

   async fetchCityAndLocation() {
      this.city = await City.findById(this.bookingData.city);
      this.location = await Location.findById(this.bookingData.location).populate('screens');
   }

   async fetchScreen() {
      this.screen = await Screen.findById(this.bookingData.screen).populate('packages');
   }

   async fetchPackage() {
      const packageName = this.bookingData.package.name;
      this.package = this.screen.packages.find(pkg => pkg.name === packageName);
      this.package.price = this.getPackagePrice(this.date);
   }

   getPackagePrice(selectedDate) {
      const dateToCheck = new Date(selectedDate);
      dateToCheck.setHours(0, 0, 0, 0);

      const customPriceEntry = this.package.customPrice.find(entry => {
         const customDate = new Date(entry.date);
         customDate.setHours(0, 0, 0, 0);
         return customDate.getTime() === dateToCheck.getTime();
      });

      return customPriceEntry ? customPriceEntry.price : this.package.price;
   }

   async slotValidation(date = this.date, slot = this.slot, screen = this.screen) {
      const thatDayBookings = await Booking.find({
         date,
         screen,
         status: { $in: ["pending", "booked"] },
      });

      const requestedFrom = new Date(date).setHours(slot.from.split(":")[0], slot.from.split(":")[1], 0, 0);
      const requestedTo = new Date(date).setHours(slot.to.split(":")[0], slot.to.split(":")[1], 0, 0);

      thatDayBookings.forEach((booking) => {
         const from = new Date(date).setHours(booking.slot.from.split(":")[0], booking.slot.from.split(":")[1], 0, 0);
         const to = new Date(date).setHours(booking.slot.to.split(":")[0], booking.slot.to.split(":")[1], 0, 0);

         if (
            (requestedFrom >= from && requestedFrom < to) ||
            (requestedTo > from && requestedTo <= to)
         ) {
            throw new Error("Requested slot is already booked on the selected date.");
         }
      });
   }

   // async slotValidation(date = this.date, slot = this.slot, screen = this.screen) {

   //    const thatDayBookings = await Booking.find({ date, screen, status: { $: "canceled" } })
   //    const requestedFrom = new Date(date).setHours(slot.from.split(":")[0], slot.from.split(":")[1], 0, 0);
   //    const requestedTo = new Date(date).setHours(slot.to.split(":")[0], slot.to.split(":")[1], 0, 0);

   //    thatDayBookings.forEach((booking) => {

   //       const from = new Date(date).setHours(booking.slot.from.split(":")[0], booking.slot.from.split(":")[1], 0, 0)
   //       const to = new Date(date).setHours(booking.slot.to.split(":")[0], booking.slot.to.split(":")[1], 0, 0)

   //       if (
   //          (requestedFrom >= from && requestedFrom < to) ||
   //          (requestedTo > from && requestedTo <= to)
   //       ) {
   //          throw new Error("Requested slot is already booked on the selected date.");
   //       }
   //    })
   // }

   async fetchOccasion() {
      if (!this.bookingData.occasion?._id) return

      // console.log(this.bookingData.occasion.celebrantName)
      let occasion = await Occasion.findOne({ _id: this.bookingData.occasion._id }, { name: 1, _id: 1, price: 1 })
      this.occasion = { _id: occasion._id, name: occasion.name, price: occasion.price, celebrantName: this.bookingData.occasion.celebrantName }
   }

   async fetchAddons() {
      if (this.bookingData.addons.length === 0) return
      const addonPromises = this.bookingData.addons.map(async addonData => {
         const addon = await Addon.findById(addonData._id);
         return {
            _id: addon._id,
            name: addon.name,
            price: addon.price,
            count: addonData.count,
         };
      });
      this.addons = await Promise.all(addonPromises);
   }

   async fetchGifts() {
      if (this.bookingData.gifts.length === 0) return
      const giftPromises = this.bookingData.gifts.map(async giftData => {
         const gift = await Gift.findById(giftData._id);
         return {
            _id: gift._id,
            name: gift.name,
            price: gift.price,
            count: giftData.count,
         };
      });
      this.gifts = await Promise.all(giftPromises);
   }

   async fetchCakes() {
      if (this.bookingData.cakes.length === 0) return
      const cakePromises = this.bookingData.cakes.map(async cakeData => {
         let flag = 0
         const cake = await Cake.findById(cakeData._id);
         if (flag === 0 && cakeData.free) {
            flag = flag + 1
            return {
               _id: cake._id,
               name: cake.name,
               price: 0,
            };
         }

         return {
            _id: cake._id,
            name: cake.name,
            price: cake.price,
            free:cakeData.free
         };
      });
      this.cakes = await Promise.all(cakePromises);
   }

   async saveCustomer() {
      try {
         const customerData = {
            number: this.bookingData.customer.number,
            name: this.bookingData.customer.name,
            email: this.bookingData.customer.email
         };

         let existingCustomer = await Customer.findOne({ number: customerData.number });

         if (!existingCustomer) {
            this.customer = await Customer.create(customerData);
         } else {
            existingCustomer.name = customerData.name;
            existingCustomer.email = customerData.email;
            this.customer = await existingCustomer.save();
         }
      } catch (error) {
         console.error("Error saving customer:", error);
         throw error;
      }
   }

   async calculateTotalPrice() {
      let couponDiscount = 0
      try {
         couponDiscount = await this.calculateCouponPrice()
         this.totalPrice = this.calculatePackagePrice() + this.calculateOccasionPrice() + this.calculateAddonsPrice() + this.calculateCakesPrice() + this.calculateGiftsPrice() + this.calculatePeoplePrice() + couponDiscount;
         this.remainingAmount = parseFloat((this.totalPrice - this.advancePrice).toFixed(2));;
      }
      catch (err) {
         console.log(err)
      }
   }

   calculatePackagePrice() {
      return this.package?.price || 0
   }

   calculateOccasionPrice() {
      return this.occasion?.price || 0;
   }

   calculateAddonsPrice() {
      if (this.addons.length === 0) return 0
      return this.addons.reduce((sum, addon) => sum + addon.price * addon.count, 0);
   }

   async calculateCouponPrice() {
      if (!this.couponCode) return 0

      const coupon = await Coupon.findOne({ code: this.couponCode.toUpperCase() });

      if (!coupon) {
         throw new Error("Invalid coupon code.");
      }

      if (!coupon.status) {
         throw new Error("This coupon is inactive.");
      }

      const currentDate = new Date();
      if (currentDate > coupon.expireDate) {
         throw new Error("This coupon has expired.");
      }
      let amount = 0

      if (coupon.type === "fixed") {
         amount = -coupon.discount;
         this.couponPrice=amount
         return amount
      } else {
         const total = this.calculatePackagePrice() + this.calculateOccasionPrice() + this.calculateAddonsPrice() + this.calculateCakesPrice() + this.calculateGiftsPrice() + this.calculatePeoplePrice();
         amount = -parseFloat(((coupon.discount / 100) * total).toFixed(2));
         this.couponPrice=amount
         return amount
      }
   }

   calculateGiftsPrice() {
      if (this.gifts.length === 0) return 0
      return this.gifts.reduce((sum, gift) => sum + gift.price * gift.count, 0)
   }

   calculateCakesPrice() {
      if (this.cakes.length === 0) return 0
      let cakes = this.cakes;

      const freeCakeIndex = cakes.findIndex(cake => cake.free === true);
      if (freeCakeIndex !== -1) {
         cakes.splice(freeCakeIndex, 1);
      }
      return cakes.reduce((sum, cake) => sum + cake.price, 0);
   }

   calculatePeoplePrice() {
      if (this.numberOfPeople > this.screen.minPeople) {
         const extraPeople = this.numberOfPeople - this.screen.minPeople;
         return this.screen.extraPersonPrice * extraPeople;
      }
      return 0;
   }


   async saveBooking(status = 'pending') {
      const bookingDetails = {
         city: this.city._id,
         location: this.location._id,
         screen: this.screen._id,
         date: new Date(this.date),
         slot: this.slot,
         package: this.package,
         occasion: this.occasion,
         addons: this.addons,
         cakes: this.cakes,
         gifts: this.gifts,
         customer: this.customer._id,
         numberOfPeople: this.numberOfPeople,
         nameOnCake: this.nameOnCake,
         ledName: this.ledName,
         ledNumber: this.ledNumber,
         note: this.note,
         status: status,
         couponPrice:this.couponPrice,
         advancePrice: this.advancePrice,
         totalPrice: this.totalPrice,
         remainingAmount: this.remainingAmount,
         couponCode: this.couponCode
      };

      const bookedData = await Booking.create(bookingDetails);
      return bookedData
   }

}


module.exports = BookingClass