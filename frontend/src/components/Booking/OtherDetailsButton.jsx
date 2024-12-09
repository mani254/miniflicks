import React, { useState, useEffect,useRef} from "react";
import { FaArrowRight } from "react-icons/fa";
import { connect } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { showNotification } from "../../redux/notification/notificationActions";
import axios from "axios";
import Loader from "../Loader/Loader";

function OtherDetailsButton({ customerBooking, showNotification, activeIndex, navOptions, setActiveIndex }) {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [verificationLoading, setVerificationLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false)
	const location = useLocation();


	useEffect(() => {
		const disabledPaths = ['/occasions', '/cakes'];
		setIsDisabled(disabledPaths.some((path) => location.pathname.endsWith(path)));
	}, [location.pathname]);


	function handleNext() {
		if(isDisabled) {
			if(!customerBooking.occasion){
				showNotification('Select atleast one Occasion')
				return
			}
			if(location.pathname.endsWith('/cakes')){
				if(!customerBooking.cakes.length>0){
					showNotification('Select atleast one Cake')
					return
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
		// Check if user is authenticated
		const authToken = localStorage.getItem("authToken");
		if (authToken) {
			navigate("/booking/payment");
			return;
		}

		try {
			setLoading(true);
			// Step 1: Create the customer booking via backend API
			const response = await axios.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/bookings/customerBooking`, customerBooking);

			if (response.data) {
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
			timeout: 10 * 60,
			handler: function (paymentResponse) {
				if (paymentResponse && paymentResponse.razorpay_payment_id) {
					console.log("Payment successful!", paymentResponse);
					verifyPayment(paymentResponse);
				}
			},
			modal: {
				ondismiss: function () {
					console.log(`Razorpay modal closed for order ID: ${razorpayOrderId}`);
					delPreviousOrder(razorpayOrderId);
				},
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
		setVerificationLoading(true);
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
					setVerificationLoading(false);
				} else {
					alert("Payment verification failed!");
					setVerificationLoading(false);
				}
			})
			.catch((error) => {
				console.error("Error verifying payment:", error);
				alert("Error during payment verification.");
				setVerificationLoading(false);
			});
	}

	function delPreviousOrder(orderId) {
		axios
			.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/bookings/delPreviousOrder`, {
				orderId,
			})
			.then((response) => {
				console.log("deleted the prev order succesfully", response.data);
			})
			.catch((error) => {
				console.error("Error deletring the previously saved booking", error);
			});
	}

	function logPaymentCancellation(orderId, reason) {
		axios
			.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/bookings/cancelPayment`, {
				orderId,
				reason,
			})
			.then((response) => {
				console.log("Payment cancellation logged successfully:", response.data);
				dispatch(showNotification("Payment canceled due to timeout or failure."));
			})
			.catch((error) => {
				console.error("Error logging payment cancellation:", error);
			});
	}

	function handlePaymentFailure(response) {
		console.error("Payment failed", response.error);
		logPaymentCancellation(response.error.metadata.order_id, response.error.description);
		alert(`Payment failed: ${response.error.description}`);
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

const mapStateToProps = (state) => {
	return {
		customerBooking: state.customerBooking,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		showNotification: (message) => dispatch(showNotification(message))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(OtherDetailsButton);
