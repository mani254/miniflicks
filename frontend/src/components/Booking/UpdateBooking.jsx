import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../Loader/Loader";
import { useAuth } from "../../hooks/useAuth";
import { useBooking } from "../../hooks/useBookings";
import { useScreens } from "../../hooks/useCatalog";
import { useBookingStore } from "../../store/bookingStore";
import { toast } from "sonner";

const UpdateBooking = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const { isLoggedIn, isInitialLoading } = useAuth();
	const { setCustomerBooking } = useBookingStore();

	const { data: booking, isLoading: isBookingLoading, isError: isBookingError } = useBooking(id);
	const { data: screens = [], isLoading: isScreensLoading } = useScreens();

	const [isProcessed, setIsProcessed] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("authToken");
		if (!token) {
			toast.error("No Access. Login again.");
			navigate("/login", { replace: true });
		}
	}, [navigate]);

	useEffect(() => {
		if (booking && screens.length > 0 && !isProcessed) {
			const screenId = typeof booking.screen === "object" ? booking.screen?._id : booking.screen;
			const locationId = typeof booking.location === "object" ? booking.location?._id : booking.location;
			const cityId = typeof booking.city === "object" ? booking.city?._id : booking.city;

			const currentScreen = screens.find((screen) => screen._id === screenId);

			if (!currentScreen) {
				toast.error("Invalid screen or screen deleted");
				navigate("/");
				return;
			}

			const localBooking = {
				city: cityId,
				location: locationId,
				screen: screenId,
				date: booking.date,
				slot: booking.slot,
				package: booking.package,
				occasion: booking.occasion,
				addons: booking.addons || [],
				gifts: booking.gifts || [],
				cakes: booking.cakes || [],
				customer: booking.customer || null,
				advance: booking.advancePrice || 0,
				note: booking.note || "",
				total: booking.totalPrice || 0,
				otherInfo: {
					numberOfPeople: booking.numberOfPeople || 0,
					nameOnCake: booking.nameOnCake || "",
					ledName: booking.ledName || "",
					ledNumber: booking.ledNumber || "",
					couponCode: booking.couponCode || "",
					couponPrice: booking.couponPrice || 0,
					numberOfExtraPeople: currentScreen.numberOfExtraPeople || 0,
					extraPersonsPrice: currentScreen.extraPersonsPrice || 0,
				},
				isEditing: true,
				fullPayment: booking.remainingAmount === 0,
				id: booking._id,
			};

			setCustomerBooking(localBooking);
			setIsProcessed(true);
			navigate("/booking/customerDetails");
		}
	}, [booking, screens, isProcessed, setCustomerBooking, navigate]);

	const isLoading = isInitialLoading || isBookingLoading || isScreensLoading;

	return (
		<div className="min-h-[400px] flex items-center justify-center">
			{isLoading && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
					<Loader />
				</div>
			)}
			{!isLoading && (isBookingError || !booking) && (
				<div>
					<h2>Invalid Booking ID</h2>
				</div>
			)}
		</div>
	);
};

export default UpdateBooking;
