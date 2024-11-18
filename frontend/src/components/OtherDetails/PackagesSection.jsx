import React, { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { useDispatch } from "react-redux";
import { setBookingPackage, setBookingOtherInfo } from "../../redux/customerBooking/customerBookingActions";
import { addonAvailable, addonUnavailable, candlePath } from "../../utils";
import { useNavigate } from "react-router-dom";
import RoseTable from "../popupts/RoseTable";
import SmokeEntry from "../popupts/SmokeEntry";
import CandlePath from "../popupts/CandlePath";

import { showModal } from "../../redux/modal/modalActions";

import smokeEntry from "../../assets/gallery/smoke/image-1.jpg";
import rosePath from "../../assets/gallery/rose-path/image-6.webp";
import roseHeart from "../../assets/gallery/rose-path/image-9.webp";

const packageAddons = ["4k Dolby Theater", "Decoration", "Cake", "Smoke Entry", "Rose Heart On Table", "Rose With Candle Path"];

function PackagesSection({ screensData, customerBooking }) {
	const [screen, setScreen] = useState(null);
	const [selectedPackage, setSelectedPackage] = useState({});

	const navigate = useNavigate();
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
	const handlePackageSelect = useCallback(
		(pack) => {
			setSelectedPackage(pack);
			dispatch(setBookingPackage(pack));
			navigate("/booking/otherdetails/occasions");
		},
		[customerBooking.otherInfo, dispatch]
	);

	function handlePopUp(type) {
		if (type == "smoke-entry") {
			dispatch(showModal({}, SmokeEntry));
		} else if (type == "rose-table") {
			dispatch(showModal({}, RoseTable));
		} else if (type == "candle-path") {
			dispatch(showModal({}, CandlePath));
		}
	}

	// function that will get prices by checking the in the customprice
	const getPackagePrice = (pack) => {
		const selectedDate = new Date(customerBooking.date).toISOString().split("T")[0];
		const todayPrice = pack.customPrice.find((custom) => {
			const customDate = new Date(new Date(custom.date).setHours(0, 0, 0, 0)).toISOString().split("T")[0];
			return customDate === selectedDate;
		});
		return todayPrice ? todayPrice.price : pack.price;
	};

	return (
		<section className="option-section pt-6 mt-4 border-t border-white">
			<div className="flex items-center justify-center mb-5 gap-5 ">
				<div className="flex flex-col items-center justify-center cursor-pointer" onClick={() => handlePopUp("smoke-entry")}>
					<div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-primary">
						<div className=" w-[92%] h-[92%] rounded-full relative bg-white overflow-hidden hover:scale-105 transition-all">
							<img className="w-full h-full absolute object-cover object-center" src={smokeEntry} alt="some-entry miniflicks" />
						</div>
					</div>
					<p className="text-xs font-medium mt-1">Some Entry</p>
				</div>

				<div className="flex flex-col items-center justify-center cursor-pointer" onClick={() => handlePopUp("candle-path")}>
					<div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-primary">
						<div className=" w-[92%] h-[92%] rounded-full relative bg-white overflow-hidden hover:scale-105 transition-all">
							<img className="w-full h-full absolute object-cover object-center" src={rosePath} alt="candle path miniflicks" />
						</div>
					</div>
					<p className="text-xs font-medium mt-1">Candle Path</p>
				</div>

				<div className="flex flex-col items-center justify-center cursor-pointer" onClick={() => handlePopUp("rose-table")}>
					<div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-primary">
						<div className=" w-[92%] h-[92%] rounded-full relative bg-white overflow-hidden hover:scale-105 transition-all">
							<img className="w-full h-full absolute object-cover object-center" src={roseHeart} alt="rose heart miniflicks" />
						</div>
					</div>
					<p className="text-xs font-medium mt-1">Rose Table</p>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cold-2 md:grid-cols-3 gap-2 md:gap-4">
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
