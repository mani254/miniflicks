import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

function OrderSummary({ customerBooking }) {
	const [pricingInfo, setPricingInfo] = useState([]);

	// function that will exicute everytime the package change to set the package price
	useEffect(() => {
		if (!customerBooking.package) {
			setPricingInfo((prev) => prev.filter((item) => item.title !== "Package"));
		} else {
			setPricingInfo((prev) => {
				const existingPackageIndex = prev.findIndex((item) => item.title === "Package");

				if (existingPackageIndex !== -1) {
					const updatedPricingInfo = [...prev];
					updatedPricingInfo[existingPackageIndex].amount = getPackagePrice(customerBooking.package);
					return updatedPricingInfo;
				} else {
					return [...prev, { title: "Package", amount: getPackagePrice(customerBooking.package) }];
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
			<h3 className="pb-2 border-b border-gray-400">Order Summary</h3>
			<div className="grid grid-cols-[auto_1fr] gap-1 mt-3">
				<h5 className="min-w-max">Date :</h5>
				<p>{customerBooking.date.toLocaleString().split(",")[0]}</p>
				<h5 className="min-w-max">Slot :</h5>
				{customerBooking.slot?.from && customerBooking.slot?.to && (
					<p>
						{convertToAMPM(customerBooking.slot?.from)} - {convertToAMPM(customerBooking.slot?.to)}
					</p>
				)}
			</div>
			<div className="mt-5">
				<h4 className="pb-2 border-b border-gray-400 text-opacity-70">Pricing Details</h4>
				<div className="grid grid-cols-2 gap-1 mt-3">
					{pricingInfo.map((single, index) => (
						<React.Fragment key={index}>
							<h5>{single.title}</h5>
							<p className="justify-self-end">{single.amount}</p>
						</React.Fragment>
					))}
				</div>
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
