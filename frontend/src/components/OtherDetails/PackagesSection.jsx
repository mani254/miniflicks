import React, { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { useDispatch } from "react-redux";
import { setBookingPackage } from "../../redux/customerBooking/customerBookingActions";
import { addonAvailable, addonUnavailable } from "../../utils";

const packageAddons = ["4k Dolby Theater", "Decoration", "Cake", "Smoke Entry", "Rose Heart On Table", "Rose With Candle Path"];

function PackagesSection({ screensData, customerBooking }) {
	const [screen, setScreen] = useState(null);
	const [selectedPackage, setSelectedPackage] = useState({});

	const dispatch = useDispatch();

	// useEffect that will select the first package or any particualr package if it is already selected  in the inital render
	useEffect(() => {
		const currentScreen = screensData.screens.find((screen) => screen._id === customerBooking.screen);
		setScreen(currentScreen);

		if (!currentScreen) return;

		if (customerBooking.package) {
			setSelectedPackage(customerBooking.package);
		} else {
			setSelectedPackage(currentScreen.packages[0]);
			dispatch(setBookingPackage(currentScreen.packages[0]));
		}
	}, [screensData.screens]);

	// function that will handle package select updates the state and updates the  redux
	const handlePackageSelect = useCallback((pack) => {
		setSelectedPackage(pack);
		dispatch(setBookingPackage(pack));
	}, []);

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
		<section className="option-section pt-6 mt-4 border-t border-white">
			<div className="grid grid-cols-3 gap-4">
				{screen?.packages &&
					screen.packages.map((pack, index) => {
						const selected = pack.name === selectedPackage.name;
						let price = getPackagePrice(pack);
						return (
							<div key={index} className={`p-[1.5px] rounded-lg cursor-pointer selected-1 ${selected ? "selected" : ""}`} onClick={() => handlePackageSelect(pack)}>
								<div className="p-3 py-4 rounded-lg bg-bright">
									<h3 className="text-primary">{pack.name}</h3>
									<h4 className="border-b border-slate-400 border-opacity-50 pb-1">₹ {price}</h4>
									<ul className="mt-2">
										{packageAddons.map((addon, index) => {
											const available = pack.addons.includes(addon);
											return (
												<li key={index} className="flex gap-2 mt-1">
													<img src={available ? addonAvailable : addonUnavailable} alt={available ? "available tick-mark" : "unavailable tick-mark"} />
													{addon}
												</li>
											);
										})}
									</ul>
								</div>
							</div>
						);
					})}
			</div>
		</section>
	);
}

const mapStateToProps = (state) => ({
	screensData: state.screens,
	customerBooking: state.customerBooking,
});

export default connect(mapStateToProps)(PackagesSection);
