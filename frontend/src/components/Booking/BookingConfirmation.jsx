import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "../../store/bookingStore";
import { useLocation } from "../../hooks/useCatalog";

const BookingConfirmation = () => {
	const [showTick, setShowTick] = useState(false);
	const navigate = useNavigate();
	const { location: locationId, resetBooking } = useBookingStore();
	const { data: location } = useLocation(locationId);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setShowTick(true);
		}, 100);

		return () => {
			clearTimeout(timeoutId);
		};
	}, []);

	const handleGoHome = () => {
		resetBooking();
		navigate("/", { replace: true });
	};

	return (
		<>
			<div className="flex flex-col items-center justify-center space-y-2 text-center p-6 h-screen -mt-[60px]">
				<div className="w-[60px] h-[60px] rounded-full flex items-center justify-center relative mb-2">
					{showTick && (
						<svg className="success-tick" width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle className="circle" cx="50" cy="50" r="38" stroke="#50AD41" fill="#50AD41" strokeWidth="10" />
							<path className="tick-mark" d="M28 52.5C29.0884 53.9803 36.2254 62.2114 40.7238 67.364C41.4939 68.2461 42.8517 68.2769 43.6648 67.4343L74 36" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					)}
				</div>
				<div className="booking-success-message">
					<h1 className="text-xl font-bold text-green-600">Booking Confirmed!</h1>
					<p className="text-lg">Thank you for choosing our service. Your booking has been successfully confirmed!</p>
					<p className="mt-2 text-sm">Please check your email for the booking details, including your itinerary. If you don&apos;t see it, kindly check your spam or junk folder.</p>
					<div className="flex items-center justify-center gap-20 my-5 flex-wrap">
						<div className="mt-4 book-now-btn">
							<button onClick={handleGoHome} className="btn-3 font-medium">
								Go to Home Page
							</button>
						</div>
						{location?.addressLink && (
							<div className="mt-4 book-now-btn">
								<button className="btn-3">
									<a href={location.addressLink} target="_blank" rel="noopener noreferrer" className="font-medium">
										Navigate to Location
									</a>
								</button>
							</div>
						)}
					</div>
				</div>
				<div className=" mt-6 space-y-4">
					<p className="text-gray-600">
						For further assistance, contact us at{" "}
						<a href="mailto:support@miniflicks.in" className="text-blue-600 underline">
							support@miniflicks.in
						</a>
						.
					</p>
				</div>
			</div>
		</>
	);
};

export default BookingConfirmation;
