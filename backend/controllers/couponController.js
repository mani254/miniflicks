const Coupon = require('../schema/couponSchema');
const { ObjectId } = require('mongoose').Types;

const addCoupon = async (req, res) => {
   try {
      const { code, discount, type, expireDate, status, scrollCoupon, scrollingText } = req.body;

      const existed = await Coupon.findOne({ code });

      if (existed) {
         return res.status(400).json({ error: "Coupon already exists" });
      }

      const coupon = new Coupon({
         code,
         discount,
         type,
         expireDate,
         status,
         scrollCoupon,
         scrollingText
      });
      await coupon.save();
      res.status(200).json({ message: 'Coupon added successfully', coupon });

   } catch (err) {
      console.error('Error while adding coupon:', err.message);
      res.status(500).json({ error: 'Internal server error.' });
   }
};

const getCoupons = async (req, res) => {
   try {
      const coupons = await Coupon.find({});
      res.status(200).send({ message: 'coupons fetched succesfully', coupons });
   } catch (err) {
      console.error('Error while fetching coupons:', err.message);
      res.status(500).json({ error: 'Internal server error.' });
   }
};

const deleteCoupon = async (req, res) => {
   try {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
         return res.status(400).json({ error: "Invalid coupon ID" });
      }

      const coupon = await Coupon.findByIdAndDelete(id);

      if (!coupon) {
         return res.status(404).json({ error: "Coupon does not exist" });
      }

      res.status(200).json({ message: 'Coupon deleted successfully', coupon });
   } catch (err) {
      console.error('Error while deleting coupon:', err.message);
      res.status(500).json({ error: 'Internal server error.' });
   }
};

const updateCoupon = async (req, res) => {
   try {
      const id = req.params.id;
      const { code, discount, type, expireDate, status } = req.body;

      if (!ObjectId.isValid(id)) {
         return res.status(400).json({ error: "Invalid coupon ID" });
      }

      const coupon = await Coupon.findById(id);
      if (!coupon) {
         return res.status(404).json({ error: "Coupon does not exist" });
      }

      if (code) coupon.code = code.toUpperCase();
      if (discount !== undefined) coupon.discount = discount;
      if (type) coupon.type = type;
      if (expireDate) coupon.expireDate = expireDate;
      coupon.status = status !== undefined ? status : coupon.status;

      await coupon.save();
      res.status(200).json({ message: 'Coupon updated successfully', coupon });
   } catch (err) {
      console.error('Error while updating coupon:', err.message);
      res.status(500).json({ error: 'Internal server error.' });
   }
};

module.exports = { addCoupon, getCoupons, deleteCoupon, updateCoupon };
