import React, { useMemo, useEffect } from "react";
import { useBookingStore } from "../../store/bookingStore";
import OtherDetailsButton from "../Booking/OtherDetailsButton";
import CouponComponent from "./CouponComponent";

function OrderSummary({ navOptions, activeIndex, setNavOptions, setActiveIndex }) {
	const {
		package: selectedPackage,
		occasion: selectedOccasion,
		addons: selectedAddons,
		gifts: selectedGifts,
		cakes: selectedCakes,
		otherInfo,
		date: bookingDate,
		slot: bookingSlot,
		isEditing,
		setBookingTotal,
	} = useBookingStore();

	const getPackagePrice = (pack) => {
		if (!pack) return 0;
		if (isEditing) return pack.price || 0;
		const selectedDate = new Date(bookingDate).toISOString().split("T")[0];
		const todayPrice = pack.customPrice?.find((custom) => {
			const customDate = new Date(new Date(custom.date).setHours(0, 0, 0, 0)).toISOString().split("T")[0];
			return customDate === selectedDate;
		});
		return todayPrice ? todayPrice.price : pack.price || 0;
	};

	const pricingInfo = useMemo(() => {
		const items = [];

		// 1. Package
		if (selectedPackage) {
			items.push({
				title: "Package",
				amount: getPackagePrice(selectedPackage),
			});
		}

		// 2. Occasion
		if (selectedOccasion) {
			items.push({
				title: "Occasion",
				amount: selectedOccasion.price || 0,
			});
		}

		// 3. Extra Persons
		if (otherInfo?.extraPersonsPrice) {
			items.push({
				title: "Extra Persons Amount",
				amount: otherInfo.extraPersonsPrice,
			});
		}

		// 4. Addons
		if (selectedAddons?.length > 0) {
			let addonAmount = selectedAddons.reduce((acc, addon) => acc + (addon.price || 0) * (addon.count || 1), 0);
			const hasLed = selectedAddons.some((item) => item.name?.toLowerCase().includes("name") || item.name === "LED Name");
			if (hasLed && otherInfo?.ledName?.length > 8) {
				addonAmount += (otherInfo.ledName.length - 8) * 30;
			}
			items.push({
				title: "Addons",
				amount: addonAmount,
			});
		}

		// 5. Cakes
		if (selectedCakes?.length > 0) {
			const cakeAmount = selectedCakes.reduce((acc, cake) => {
				if (cake.free) {
					return acc + (cake.special ? (cake.specialPrice || 0) : 0);
				}
				return acc + (cake.price || 0);
			}, 0);
			items.push({
				title: "Cakes",
				amount: cakeAmount,
			});
		}

		// 6. Gifts
		if (selectedGifts?.length > 0) {
			const giftAmount = selectedGifts.reduce((acc, gift) => acc + (gift.price || 0) * (gift.count || 1), 0);
			items.push({
				title: "Gifts",
				amount: giftAmount,
			});
		}

		// 7. Coupon
		if (otherInfo?.couponCode && otherInfo?.couponPrice) {
			items.push({
				title: "Coupon",
				amount: -Math.abs(otherInfo.couponPrice),
			});
		}

		return items;
	}, [selectedPackage, selectedOccasion, selectedAddons, selectedGifts, selectedCakes, otherInfo, bookingDate, isEditing]);

	const total = useMemo(() => {
		const rawTotal = pricingInfo.reduce((acc, item) => acc + item.amount, 0);
		return Math.max(0, parseFloat(rawTotal.toFixed(2)));
	}, [pricingInfo]);

	// Sync calculated total to bookingStore
	useEffect(() => {
		setBookingTotal(total);
	}, [total, setBookingTotal]);

	const convertToAMPM = (time) => {
		if (!time) return "";
		const [hours, minutes] = time.split(":");
		const period = hours >= 12 ? "PM" : "AM";
		const formattedHours = hours % 12 || 12;
		return `${formattedHours}:${minutes} ${period}`;
	};

	return (
		<div className="bg-white p-5 rounded-lg">
			<h3 className="pb-2 border-b border-gray-300">Order Summary</h3>
			<div className="grid grid-cols-[auto_1fr] gap-1 mt-3">
				<h5 className="min-w-max">Date :</h5>
				<p>{new Date(bookingDate).toLocaleString().split(",")[0]}</p>
				<h5 className="min-w-max">Slot :</h5>
				{bookingSlot?.from && bookingSlot?.to && (
					<p>
						{convertToAMPM(bookingSlot.from)} - {convertToAMPM(bookingSlot.to)}
					</p>
				)}
			</div>
			<div className="mt-5">
				<h4 className="pb-2 border-b border-gray-300 text-opacity-70">Pricing Details</h4>
				<div className="grid grid-cols-2 gap-1 mt-3">
					{pricingInfo.map((single, index) => (
						<React.Fragment key={index}>
							<h5>{single.title}</h5>
							<p className="justify-self-end">{single.amount}</p>
						</React.Fragment>
					))}
				</div>
				<div className="grid grid-cols-2 gap-1 mt-2 border-t border-gray-300 pt-1">
					<h5>Total</h5>
					<p className="justify-self-end">{total}</p>
				</div>
				<div className="book-now-btn mt-3">
					<OtherDetailsButton navOptions={navOptions} setActiveIndex={setActiveIndex} activeIndex={activeIndex} />
				</div>
				{selectedPackage?.name?.toLowerCase() !== "basic" && (
					<CouponComponent subtotalWithoutCoupon={pricingInfo.filter((i) => i.title !== "Coupon").reduce((acc, i) => acc + i.amount, 0)} />
				)}
			</div>
		</div>
	);
}

export default OrderSummary;
