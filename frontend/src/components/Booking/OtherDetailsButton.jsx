import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useBookingStore } from "../../store/bookingStore";
import { useCreateCustomerBooking } from "../../hooks/useBookings";
import { usePayments } from "../../hooks/usePayments";
import { openRazorpayCheckout } from "../../lib/razorpay";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";

function OtherDetailsButton({ activeIndex, navOptions, setActiveIndex }) {
	const navigate = useNavigate();
	const location = useLocation();

	const bookingState = useBookingStore();
	const createCustomerBookingMutation = useCreateCustomerBooking();
	const { verifyPayment, cancelPayment } = usePayments();

	const [loading, setLoading] = useState(false);
	const [verificationLoading, setVerificationLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);

	useEffect(() => {
		const disabledPaths = ["/occasions", "/cakes"];
		setIsDisabled(disabledPaths.some((path) => location.pathname.endsWith(path)));
	}, [location.pathname]);

	function handleNext() {
		if (isDisabled) {
			if (!bookingState.occasion) {
				toast.error("Select at least one Occasion");
				return;
			}
			if (location.pathname.endsWith("/cakes")) {
				if (!bookingState.cakes?.length) {
					toast.error("Select at least one Cake");
					return;
				}
			}
		}

		if (activeIndex < navOptions.length - 1) {
			setActiveIndex((prev) => prev + 1);
			navigate(`${navOptions[activeIndex + 1].toLowerCase()}`);
		} else {
			handlePayment();
		}
	}

	async function handlePayment() {
		// If admin is authenticated, navigate to admin PaymentPage
		const authToken = localStorage.getItem("authToken");
		if (authToken) {
			navigate("/booking/payment");
			return;
		}

		try {
			setLoading(true);

			// Format payload for createCustomerBooking matching backend schema
			const payload = {
				city: bookingState.city,
				location: bookingState.location,
				screen: bookingState.screen,
				date: bookingState.date,
				slot: bookingState.slot,
				package: {
					name: typeof bookingState.package === "string" ? bookingState.package : (bookingState.package?.name || ""),
				},
				occasion: {
					_id: bookingState.occasion?._id,
					celebrantName: bookingState.occasion?.celebrantName || "",
				},
				addons: (bookingState.addons || []).map((a) => ({ _id: a._id, count: a.count })),
				gifts: (bookingState.gifts || []).map((g) => ({ _id: g._id, count: g.count })),
				cakes: (bookingState.cakes || []).map((c) => ({ _id: c._id, free: Boolean(c.free) })),
				customer: bookingState.customer || { name: "", email: "", number: "" },
				otherInfo: {
					numberOfPeople: bookingState.otherInfo?.numberOfPeople || 0,
					numberOfExtraPeople: bookingState.otherInfo?.numberOfExtraPeople || 0,
					nameOnCake: bookingState.otherInfo?.nameOnCake || "",
					ledName: bookingState.otherInfo?.ledName || "",
					ledNumber: bookingState.otherInfo?.ledNumber || "",
					couponCode: bookingState.otherInfo?.couponCode || null,
				},
				advance: bookingState.advance || 0,
				note: bookingState.note || "",
			};

			const result = await createCustomerBookingMutation.mutateAsync(payload);
			const { booking, razorpayOrderId } = result;

			setLoading(false);

			if (razorpayOrderId) {
				try {
					const paymentResponse = await openRazorpayCheckout({
						orderId: razorpayOrderId,
						amountPaise: (booking.totalPrice || bookingState.total) * 100,
						customerName: bookingState.customer?.name,
						customerEmail: bookingState.customer?.email,
						customerNumber: bookingState.customer?.number,
					});

					// Verify payment on backend
					setVerificationLoading(true);
					await verifyPayment({
						razorpay_order_id: paymentResponse.razorpay_order_id,
						razorpay_payment_id: paymentResponse.razorpay_payment_id,
						razorpay_signature: paymentResponse.razorpay_signature,
					});
					setVerificationLoading(false);

					toast.success("Payment verified successfully!");
					navigate("/bookingConfirmation", { replace: true });
				} catch (err) {
					console.warn("Payment flow cancelled/failed:", err);
					await cancelPayment(razorpayOrderId).catch(() => {});
					toast.error(err.message || "Payment cancelled");
				}
			}
		} catch (error) {
			setLoading(false);
			console.error("Booking error:", error);
			toast.error(error.message || "Something went wrong while initiating booking");
		}
	}

	return (
		<>
			{(loading || verificationLoading) && (
				<div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
					<Loader />
				</div>
			)}
			<button className="btn-3 text-center flex w-full items-center gap-2 m-auto" onClick={handleNext}>
				{activeIndex < navOptions.length - 1 ? "Next" : "Payment"} <FaArrowRight className="text-xs" />
			</button>
		</>
	);
}

export default OtherDetailsButton;
