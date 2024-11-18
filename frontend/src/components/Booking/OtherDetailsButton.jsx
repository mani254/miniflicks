import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { connect } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showNotification } from "../../redux/notification/notificationActions";
import axios from "axios";
import Loader from "../Loader/Loader";

function OtherDetailsButton({ customerBooking, activeIndex, navOptions, setActiveIndex }) {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	function handleNext() {
		if (activeIndex < navOptions.length - 1) {
			setActiveIndex((prev) => prev + 1);
			navigate(`${navOptions[activeIndex + 1].toLowerCase()}`);
		} else {
			handlePayment();
		}
	}

	async function handlePayment() {
		// Check if user is authenticated
		const authToken = localStorage.getItem("authToken");
		console.log(authToken, "authToken");
		if (authToken) {
			navigate("/booking/payment");
			return;
		}

		try {
			setLoading(true);
			// Step 1: Create the customer booking via backend API
			const response = await axios.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/bookings/customerBooking`, customerBooking);

			if (response.data) {
				// Step 2: Call Razorpay payment initiation function
				startRazorpayPayment({
					booking: response.data.booking,
					razorpayOrderId: response.data.razorpayOrderId,
				});
				setLoading(false);
			} else {
				console.log("Error: No response data received");
				setLoading(false);
			}
		} catch (error) {
			setLoading(false);
			const errMessage = error.response ? error.response.data.error : "Something went wrong";
			console.log(errMessage);
			dispatch(showNotification(errMessage));
		}
	}

	function startRazorpayPayment({ booking, razorpayOrderId }) {
		if (typeof Razorpay === "undefined") {
			console.error("Razorpay SDK not loaded");
			return;
		}

		const options = {
			key_id: import.meta.env.VITE_RAZORPAY_KEY_ID,
			amount: booking.totalPrice * 100,
			currency: "INR",
			name: "Miniflicks Theater",
			description: "Booking Payment",
			order_id: razorpayOrderId,
			timeout: 20 * 60,
			handler: function (paymentResponse) {
				console.log("Payment successful!", paymentResponse);

				// Send payment details to the backend for verification
				verifyPayment(paymentResponse);
			},
			prefill: {
				name: customerBooking.customer.name,
				email: customerBooking.customer.email,
				contact: customerBooking.customer.number,
			},
		};

		try {
			const rzp = new Razorpay(options);
			rzp.on("payment.failed", function (response) {
				handlePaymentFailure(response);
			});
			rzp.open();
		} catch (error) {
			console.error("Error initializing Razorpay:", error);
		}
	}

	function verifyPayment(paymentResponse) {
		// Send the payment details to the backend for verification
		axios
			.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/bookings/verifyPayment`, {
				razorpay_payment_id: paymentResponse.razorpay_payment_id,
				razorpay_order_id: paymentResponse.razorpay_order_id,
				razorpay_signature: paymentResponse.razorpay_signature,
			})
			.then((response) => {
				if (response.data.success) {
					navigate("/bookingConfirmation");
					alert("Payment verified successfully!");
					// Optionally, navigate to success page
				} else {
					alert("Payment verification failed!");
				}
			})
			.catch((error) => {
				console.error("Error verifying payment:", error);
				alert("Error during payment verification.");
			});
	}

	function handlePaymentFailure(response) {
		console.error("Payment failed", response.error);

		alert(`Payment failed: ${response.error.description}`);
	}

	return (
		<>
			{loading && (
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

const mapStateToProps = (state) => {
	return {
		customerBooking: state.customerBooking,
	};
};

export default connect(mapStateToProps, null)(OtherDetailsButton);
