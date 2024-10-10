const Coupon = require('../schema/couponSchema');
const { ObjectId } = require('mongoose').Types;

class CouponController {
   constructor() {
      this.addCoupon = this.addCoupon.bind(this);
      this.getCoupons = this.getCoupons.bind(this);
      this.deleteCoupon = this.deleteCoupon.bind(this);
      this.updateCoupon = this.updateCoupon.bind(this);
   }

   async addCoupon(req, res) {
      try {
         const { code, discount, type, expireDate, status } = req.body;

         const existed = await Coupon.findOne({ code });
         if (existed) {
            return res.status(400).json({ error: "Coupon already exists" });
         }

         const coupon = new Coupon({
            code: code.toUpperCase(),
            discount,
            type,
            expireDate,
            status
         });
         await coupon.save();
         res.status(200).json({ message: 'Coupon added successfully', coupon });
      } catch (err) {
         this.handleError(res, err, 'Error while adding coupon');
      }
   }

   async getCoupons(req, res) {
      try {
         const coupons = await Coupon.find({});
         res.status(200).json({ message: 'Coupons fetched successfully', coupons });
      } catch (err) {
         this.handleError(res, err, 'Error while fetching coupons');
      }
   }

   async deleteCoupon(req, res) {
      try {
         const id = req.params.id;
         if (!this.isValidId(id)) {
            return res.status(400).json({ error: "Invalid coupon ID" });
         }

         const coupon = await Coupon.findByIdAndDelete(id);
         if (!coupon) {
            return res.status(404).json({ error: "Coupon does not exist" });
         }

         res.status(200).json({ message: 'Coupon deleted successfully', coupon });
      } catch (err) {
         this.handleError(res, err, 'Error while deleting coupon');
      }
   }

   async updateCoupon(req, res) {
      try {
         const id = req.params.id;
         if (!this.isValidId(id)) {
            return res.status(400).json({ error: "Invalid coupon ID" });
         }

         const coupon = await Coupon.findById(id);
         if (!coupon) {
            return res.status(404).json({ error: "Coupon does not exist" });
         }

         const { code, discount, type, expireDate, status } = req.body;
         if (code) coupon.code = code.toUpperCase();
         if (discount !== undefined) coupon.discount = discount;
         if (type) coupon.type = type;
         if (expireDate) coupon.expireDate = expireDate;
         coupon.status = status !== undefined ? status : coupon.status;

         await coupon.save();
         res.status(200).json({ message: 'Coupon updated successfully', coupon });
      } catch (err) {
         this.handleError(res, err, 'Error while updating coupon');
      }
   }

   isValidId(id) {
      return ObjectId.isValid(id);
   }

   handleError(res, error, context) {
      console.error(context, error.message);
      res.status(500).json({ error: 'Internal server error.' });
   }
}

module.exports = new CouponController();