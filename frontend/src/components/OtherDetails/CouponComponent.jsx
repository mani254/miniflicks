import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import { setBookingOtherInfo } from "../../redux/customerBooking/customerBookingActions";
import { validateCoupon } from "../../redux/coupon/couponActions";

function CouponComponent({ customerBooking, setPricingInfo, pricingInfo }) {
	const [couponCode, setCouponCode] = useState("");
	const [showCoupon, setShowCoupon] = useState(false);
	const [currentCoupon, setCurrentCoupon] = useState(null);
	const [error, setError] = useState("");

	const dispatch = useDispatch();

	// Clears the coupon code from local and Redux state when `showCoupon` is false.
	useEffect(() => {
		if (!showCoupon) {
			setCouponCode("");
			setCurrentCoupon(null);
			setError("");
			dispatch(setBookingOtherInfo({ ...customerBooking.otherInfo, couponCode: "" }));
			setPricingInfo((prev) => prev.filter((item) => item.title !== "Coupon"));
		}
	}, [showCoupon]);

	const updateCouponAmount = (coupon) => {
		if (!coupon) return;

		let amount;
		if (coupon.type === "fixed") {
			amount = -coupon.discount;
		} else {
			const total = pricingInfo.reduce((acc, item) => acc + item.amount, 0);
			amount = -parseFloat(((coupon.discount / 100) * total).toFixed(2));
		}

		setPricingInfo((prev) => {
			const existingIndex = prev.findIndex((item) => item.title === "Coupon");

			if (existingIndex !== -1) {
				const updatedPricingInfo = [...prev];
				updatedPricingInfo[existingIndex].amount = amount;
				return updatedPricingInfo;
			} else {
				return [...prev, { title: "Coupon", amount }];
			}
		});
	};

	async function handleCouponCode(e) {
		e.preventDefault();

		try {
			const res = await validateCoupon(couponCode);

			if (res && res.coupon) {
				setError("");
				setCurrentCoupon(res.coupon);
				dispatch(setBookingOtherInfo({ ...customerBooking.otherInfo, couponCode })); // Dispatch only when coupon is valid
				updateCouponAmount(res.coupon);
			}
		} catch (err) {
			setError(err.message || "An error occurred while validating the coupon.");
		}
	}

	return (
		<>
			{showCoupon && (
				<>
					<form className="filters w-full flex mt-5 m-auto items-center justify-between gap-2" onSubmit={handleCouponCode}>
						<div className="input-wrapper w-full">
							<input type="text" placeholder="COUPON CODE" id="couponCode" name="couponCode" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} required />
						</div>
						<button className="bg-gradient-primary text-white rounded-md px-4 py-[2px]">Add</button>
					</form>
					{error && <p className="text-xs text-red-500">{error}</p>}
				</>
			)}
			<div className="flex justify-between">
				<div></div>
				<p className="mt-3 font-medium text-primary cursor-pointer" onClick={() => setShowCoupon(!showCoupon)}>
					{showCoupon ? "Remove Coupon" : "Apply Coupon"}?
				</p>
			</div>
		</>
	);
}

const mapStateToProps = (state) => {
	return {
		customerBooking: state.customerBooking,
	};
};

export default connect(mapStateToProps, null)(CouponComponent);
