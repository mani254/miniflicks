import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fingerImage } from "../../utils";
import { FaArrowRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "../../store/bookingStore";
import { useScreen } from "../../hooks/useCatalog";
import { useBookedSlots } from "../../hooks/useBookings";

function Slots() {
	const navigate = useNavigate();
	const { screen: selectedScreenId, date: bookingDate, slot: currentSlot, setBookingSlot } = useBookingStore();

	const { data: screen } = useScreen(selectedScreenId);
	const { data: bookedSlots = [] } = useBookedSlots(selectedScreenId, bookingDate);

	const [selectedSlot, setSelectedSlot] = useState({ from: "", to: "" });

	// Handle slot selection
	const handleSlotSelection = useCallback((slot) => {
		setSelectedSlot(slot);
		setBookingSlot(slot);
	}, [setBookingSlot]);

	useEffect(() => {
		setSelectedSlot({ from: "", to: "" });
	}, [bookingDate]);

	useEffect(() => {
		if (currentSlot?.from && currentSlot?.to) {
			setSelectedSlot(currentSlot);
		}
	}, [currentSlot]);

	const unavailableSlots = useMemo(() => {
		if (!screen?.slots) return [];
		let unavailable = [];

		const bDate = new Date(bookingDate).setHours(0, 0, 0, 0);
		const cDate = new Date().setHours(0, 0, 0, 0);

		if (cDate === bDate) {
			const now = new Date();
			const currentHour = now.getHours();
			const currentMinute = now.getMinutes();

			unavailable = screen.slots.filter((slot) => {
				const [slotHour, slotMinute] = slot.from.split(":").map(Number);
				return slotHour < currentHour || (slotHour === currentHour && slotMinute < currentMinute);
			});
		}

		if (bookedSlots?.length > 0) {
			unavailable = unavailable.concat(bookedSlots);
		}

		return unavailable;
	}, [screen, bookingDate, bookedSlots]);

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
						<p>{new Date(bookingDate).toLocaleString().split(",")[0]}</p>
						<img className="rotate-180 w-9 floating" src={fingerImage} alt="finger 3d icon" />
					</div>
					<div className="h-[2px] w-full bg-bright rounded-full"></div>
				</div>
				{screen ? (
					<div className="flex gap-2 md:gap-4 flex-wrap items-center mt-4 justify-evenly md:justify-center">
						{screen.slots?.map((slot, index) => {
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

export default Slots;
