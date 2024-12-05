import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import CouponComponent from "./CouponComponent";
import { setBookingTotal } from "../../redux/customerBooking/customerBookingActions";
import OtherDetailsButton from "../Booking/OtherDetailsButton";

function OrderSummary({ customerBooking, navOptions, activeIndex, setNavOptions, setActiveIndex }) {
	const [pricingInfo, setPricingInfo] = useState([]);
	const [total, setTotal] = useState(0);
	const navigate = useNavigate();
	const dispatch = useDispatch();

	// function that will exicute everytime the package change to set the package price
	useEffect(() => {
		console.log(customerBooking.package,'package -----')
		console.log(pricingInfo,'pricingInfo')
		if (!customerBooking.package) {
			setPricingInfo((prev) => prev.filter((item) => item.title !== "Package"));
		} else {
			setPricingInfo((prev) => {
				const existingPackageIndex = prev.findIndex((item) => item.title === "Package");

				console.log(existingPackageIndex)

				if (existingPackageIndex !== -1) {
					const updatedPricingInfo = [...prev];
					if(customerBooking.isEditing){
						updatedPricingInfo[existingPackageIndex].price = customerBooking.package.price
					}else{
						updatedPricingInfo[existingPackageIndex].amount = getPackagePrice(customerBooking.package);
					}
					return updatedPricingInfo;
				} else {
					if(customerBooking.isEditing){

						return [...prev, { title: "Package", amount: customerBooking.package.price}];
					}
					else{
						return [...prev, { title: "Package", amount: getPackagePrice(customerBooking.package) }];
					}
				}
			});
		}
	}, [customerBooking.package]);

	// Manage "Occasion" in pricingInfo based on customerBooking.occasion's existence and value
	useEffect(() => {
		if (!customerBooking.occasion) {
			setPricingInfo((prev) => prev.filter((item) => item.title !== "Occasion"));
		} else {
			setPricingInfo((prev) => {
				const existingOccasionIndex = prev.findIndex((item) => item.title === "Occasion");

				if (existingOccasionIndex !== -1) {
					const updatedPricingInfo = [...prev];
					updatedPricingInfo[existingOccasionIndex].amount = customerBooking.occasion.price;
					return updatedPricingInfo;
				} else {
					return [...prev, { title: "Occasion", amount: customerBooking.occasion.price }];
				}
			});
		}
	}, [customerBooking.occasion]);

	// Mangage "Addons in pricingInfo based on customerBooking.addons's existence and value"
	useEffect(() => {
		if (customerBooking.addons.length == 0) {
			setPricingInfo((prev) => prev.filter((item) => item.title !== "Addons"));
		} else {
			const amount = customerBooking.addons.reduce((acc, addon) => acc + addon.price * addon.count, 0);
			setPricingInfo((prev) => {
				const existingAddonsIndex = prev.findIndex((item) => item.title === "Addons");

				if (existingAddonsIndex !== -1) {
					const updatedPricingInfo = [...prev];
					updatedPricingInfo[existingAddonsIndex].amount = amount;
					return updatedPricingInfo;
				} else {
					return [...prev, { title: "Addons", amount }];
				}
			});
		}
	}, [customerBooking.addons]);

	useEffect(() => {
		let amount = customerBooking?.otherInfo.extraPersonsPrice || 0;

		setPricingInfo((prev) => {
			const existingIndex = prev.findIndex((item) => item.title === "Extra Persons Amount");

			if (existingIndex !== -1) {
				const updatedPricingInfo = [...prev];
				updatedPricingInfo[existingIndex].amount = amount;
				return updatedPricingInfo;
			} else {
				return [...prev, { title: "Extra Persons Amount", amount }];
			}
		});
	}, [customerBooking.otherInfo]);

	// Mangage "Cakes in pricingInfo based on customerBooking.cake's existence and value"
	useEffect(() => {
		if (customerBooking.cakes.length == 0) {
			setPricingInfo((prev) => prev.filter((item) => item.title !== "Cakes"));
		} else {
			const amount = customerBooking.cakes.reduce((acc, addon) => acc + addon.price , 0);
			setPricingInfo((prev) => {
				const existingCakesIndex = prev.findIndex((item) => item.title === "Cakes");

				if (existingCakesIndex !== -1) {
					const updatedPricingInfo = [...prev];
					updatedPricingInfo[existingCakesIndex].amount = amount;
					return updatedPricingInfo;
				} else {
					return [...prev, { title: "Cakes", amount }];
				}
			});
		}
	}, [customerBooking.cakes]);

	// Manage "Gifts" in pricingInfo based on customerBooking.gifts' existence and value
	useEffect(() => {
		if (customerBooking.gifts.length === 0) {
			setPricingInfo((prev) => prev.filter((item) => item.title !== "Gifts"));
		} else {
			const amount = customerBooking.gifts.reduce((acc, gift) => acc + gift.price * gift.count, 0);
			setPricingInfo((prev) => {
				const existingGiftsIndex = prev.findIndex((item) => item.title === "Gifts");

				if (existingGiftsIndex !== -1) {
					const updatedPricingInfo = [...prev];
					updatedPricingInfo[existingGiftsIndex].amount = amount;
					return updatedPricingInfo;
				} else {
					return [...prev, { title: "Gifts", amount }];
				}
			});
		}
	}, [customerBooking.gifts]);

	useEffect(() => {
		const total = pricingInfo.reduce((acc, item) => acc + item.amount, 0);
		setTotal(total);
		dispatch(setBookingTotal(total));
	}, [pricingInfo]);

	// function to convert slot timing just to show
	const convertToAMPM = (time) => {
		const [hours, minutes] = time.split(":");
		const period = hours >= 12 ? "PM" : "AM";
		const formattedHours = hours % 12 || 12;
		return `${formattedHours}:${minutes} ${period}`;
	};

	// function that will get prices by checking the in the customprice
	const getPackagePrice = (pack) => {
		const selectedDate = new Date(customerBooking.date).toISOString().split("T")[0];
		const todayPrice = pack.customPrice.find((custom) => {
			const customDate = new Date(new Date(custom.date).setHours(0, 0, 0, 0)).toISOString().split("T")[0];
			console.log(customDate, selectedDate);
			return customDate === selectedDate;
		});

		return todayPrice ? todayPrice.price : pack.price;
	};

	return (
		<div className="bg-white p-5 rounded-lg">
			<h3 className="pb-2 border-b border-gray-300">Order Summary</h3>
			<div className="grid grid-cols-[auto_1fr] gap-1 mt-3">
				<h5 className="min-w-max">Date :</h5>
				<p>{new Date(customerBooking.date).toLocaleString().split(",")[0]}</p>
				<h5 className="min-w-max">Slot :</h5>
				{customerBooking.slot?.from && customerBooking.slot?.to && (
					<p>
						{convertToAMPM(customerBooking.slot?.from)} - {convertToAMPM(customerBooking.slot?.to)}
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
					{/* <button className="btn-3 text-center flex w-full items-center gap-2 m-auto" onClick={handlePayment}>
						Payment <FaArrowRight className="text-xs" />
					</button> */}
					{/* <button className="btn-3 text-center flex w-full items-center gap-2 m-auto" onClick={handleNext}>
						{activeIndex < navOptions.length - 1 ? "Next" : "Payment"} <FaArrowRight className="text-xs" />
					</button> */}
					<OtherDetailsButton navOptions={navOptions} setActiveIndex={setActiveIndex} activeIndex={activeIndex} />
				</div>
				<CouponComponent pricingInfo={pricingInfo} setPricingInfo={setPricingInfo} />
			</div>
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		customerBooking: state.customerBooking,
	};
};

export default connect(mapStateToProps, null)(OrderSummary);
