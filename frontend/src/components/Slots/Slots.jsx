import React, { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { useDispatch } from "react-redux";
import { fingerImage } from "../../utils";
import { FaArrowRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

import { setBookingSlot } from "../../redux/customerBooking/customerBookingActions";

function Slots({ customerBooking, screensData }) {
	const [screen, setScreen] = useState(null);
	const [unavailableSlots, setUnavailableSlots] = useState([]);
	const [selectedSlot, setSelectedSlot] = useState({ from: "", to: "" });
	const [currentTime, setCurrentTime] = useState("");

	const dispatch = useDispatch();
	const navigate = useNavigate();

	// Set the current time in 'HH:mm' format
	useEffect(() => {
		const now = new Date();
		const hours = String(now.getHours()).padStart(2, "0");
		const minutes = String(now.getMinutes()).padStart(2, "0");
		setCurrentTime(`${hours}:${minutes}`);
	}, []);

	// Handle slot selection
	const handleSlotSelection = useCallback((slot) => {
		setSelectedSlot(slot);
		dispatch(setBookingSlot(slot));
	}, []);

	useEffect(() => {
		setSelectedSlot({ from: "", to: "" });
	}, [customerBooking.date]);

	useEffect(() => {
		if (customerBooking.slot) {
			setSelectedSlot(customerBooking.slot);
		}
	}, []);

	useEffect(() => {
		// Set current screen
		const currentScreen = screensData.screens.find((screen) => screen._id === customerBooking.screen);
		if (currentScreen) {
			setScreen(currentScreen);

			let currentDate = new Date().setHours(0, 0, 0, 0);
			const bookingDate = new Date(customerBooking.date).setHours(0, 0, 0, 0);
			if (currentDate !== bookingDate) {
				return setUnavailableSlots([]);
			}

			// Populate unavailable slots based on current time
			const now = new Date();
			const currentHour = now.getHours();
			const currentMinute = now.getMinutes();

			const unavailable = currentScreen.slots.filter((slot) => {
				const [slotHour, slotMinute] = slot.from.split(":").map(Number);
				return slotHour < currentHour || (slotHour === currentHour && slotMinute < currentMinute);
			});

			setUnavailableSlots(unavailable);
		}
	}, [customerBooking.screen, screensData.screens, customerBooking.date]);

	const convertToAMPM = (time) => {
		const [hours, minutes] = time.split(":");
		const period = hours >= 12 ? "PM" : "AM";
		const formattedHours = hours % 12 || 12;
		return `${formattedHours}:${minutes} ${period}`;
	};

	function handleNext() {
		navigate("/booking/customerdetails");
	}
	return (
		<div className="mt-5">
			<>
				<div className="flex items-center gap-3">
					<div className="h-[2px] w-full bg-bright rounded-full"></div>
					<div className="min-w-[130px] flex flex-col items-center">
						<h5 className="text-center"> Select Your Slot</h5>
						<p>{new Date(customerBooking.date).toLocaleString().split(",")[0]}</p>
						<img className="rotate-180 w-9 floating" src={fingerImage} alt="finger 3d icon" />
					</div>
					<div className="h-[2px] w-full bg-bright rounded-full"></div>
				</div>
				{screen ? (
					<div className="flex gap-2 md:gap-4 flex-wrap items-center mt-4 justify-evenly md:justify-center">
						{screen.slots.map((slot, index) => {
							const isUnavailable = unavailableSlots.some((unavailableSlot) => unavailableSlot.from === slot.from);
							return (
								<div className={`slot px-3 py-1 sm:px-5 sm:py-1 border border-gray-700 rounded-full border-opacity-80 cursor-pointer ${slot.from === selectedSlot.from ? "selected" : ""} ${isUnavailable ? "unavailable" : ""}`} key={index} onClick={() => !isUnavailable && handleSlotSelection(slot)}>
									<p className="whitespace-nowrap relative z-10 text-xs sm:text-sm">
										{convertToAMPM(slot.from)} - {convertToAMPM(slot.to)}
									</p>
								</div>
							);
						})}
					</div>
				) : (
					<div className="flex gap-2 md:gap-4 flex-wrap items-center mt-4 justify-evenly md:justify-center">
						{Array.from({ length: 5 }, () => "1:00 AM - 2:00 PM").map((value, index) => {
							return (
								<div className={`slot px-3 py-1 sm:px-5 sm:py-1 border bg-gray-500 bg-opacity-10 rounded-full border-opacity-80`} key={index}>
									<p className="whitespace-nowrap relative z-10 text-xs sm:text-sm opacity-10">{value}</p>
								</div>
							);
						})}
					</div>
				)}

				{selectedSlot.from && selectedSlot.to && (
					<div className="book-now-btn mt-4">
						<button
							className="btn-3 text-center flex w-[200px] items-center gap-2 m-auto"
							onClick={() => {
								handleNext();
							}}>
							Next <FaArrowRight />
						</button>
					</div>
				)}
			</>
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		customerBooking: state.customerBooking,
		screensData: state.screens,
	};
};

export default connect(mapStateToProps, null)(Slots);
