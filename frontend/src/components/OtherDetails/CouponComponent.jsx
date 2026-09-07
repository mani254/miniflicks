import React, { useState, useEffect } from "react";
import { useBookingStore } from "../../store/bookingStore";
import { useValidateCoupon } from "../../hooks/useCatalog";

function CouponComponent({ subtotalWithoutCoupon }) {
	const { date: bookingDate, otherInfo, setBookingOtherInfo } = useBookingStore();
	const validateCouponMutation = useValidateCoupon();

	const [couponCode, setCouponCode] = useState("");
	const [showCoupon, setShowCoupon] = useState(false);
	const [error, setError] = useState("");

	// Initialize if already applied
	useEffect(() => {
		if (otherInfo?.couponCode) {
			setShowCoupon(true);
			setCouponCode(otherInfo.couponCode);
		}
	}, [otherInfo?.couponCode]);

	// Toggle coupon input visibility
	const handleToggleCoupon = () => {
		if (showCoupon) {
			// Remove coupon
			setShowCoupon(false);
			setCouponCode("");
			setError("");
			setBookingOtherInfo({
				...otherInfo,
				couponCode: "",
				couponPrice: 0,
			});
		} else {
			setShowCoupon(true);
		}
	};

	async function handleCouponCode(e) {
		e.preventDefault();
		setError("");

		try {
			const res = await validateCouponMutation.mutateAsync({ code: couponCode, date: bookingDate });

			if (res && res.coupon) {
				const coupon = res.coupon;
				let discount = 0;
				if (coupon.type === "fixed") {
					discount = Number(coupon.discount) || 0;
				} else {
					discount = parseFloat((((Number(coupon.discount) || 0) / 100) * subtotalWithoutCoupon).toFixed(2));
				}

				setError("");
				setBookingOtherInfo({
					...otherInfo,
					couponCode: coupon.code || couponCode,
					couponPrice: discount,
				});
			} else {
				setError("Invalid coupon");
			}
		} catch (err) {
			setError(err.message || "Coupon verification has failed");
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
						<button className="bg-gradient-primary text-white rounded-md px-4 py-[2px]" disabled={validateCouponMutation.isPending}>
							{validateCouponMutation.isPending ? "..." : "Add"}
						</button>
					</form>
					{error && <p className="text-xs text-red-500">{error}</p>}
				</>
			)}
			<div className="flex justify-between">
				<div></div>
				<p className="mt-3 font-medium text-primary cursor-pointer" onClick={handleToggleCoupon}>
					{showCoupon ? "Remove Coupon" : "Apply Coupon"}?
				</p>
			</div>
		</>
	);
}

export default CouponComponent;
