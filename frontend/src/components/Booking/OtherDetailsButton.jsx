import React, { useState, useEffect } from "react";
import { FaArrowRight, FaExclamationTriangle, FaCalendarAlt, FaClock } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useBookingStore } from "../../store/bookingStore";
import { useCreateCustomerBooking } from "../../hooks/useBookings";
import { bookingsApi } from "../../api/bookings";
import { usePayments } from "../../hooks/usePayments";
import { openRazorpayCheckout } from "../../lib/razorpay";
import { toast } from "sonner";
import Loader from "../Loader/Loader";

function OtherDetailsButton({ activeIndex, navOptions, setActiveIndex }) {
	const navigate = useNavigate();
	const location = useLocation();
	const queryClient = useQueryClient();

	const bookingState = useBookingStore();
	const createCustomerBookingMutation = useCreateCustomerBooking();
	const { verifyPayment, cancelPayment } = usePayments();

	const [loading, setLoading] = useState(false);
	const [verificationLoading, setVerificationLoading] = useState(false);

	// Slot conflict alert dialog state
	const [slotAlert, setSlotAlert] = useState({
		open: false,
		title: "",
		message: "",
		slot: null,
		date: null,
	});

	function handleNext() {
		const occIndex = navOptions.findIndex((opt) => opt.toLowerCase() === "occasions");
		if (activeIndex >= occIndex && !bookingState.occasion) {
			toast.error("Please select an Occasion to continue");
			if (occIndex !== -1) {
				setActiveIndex(occIndex);
				navigate(navOptions[occIndex].toLowerCase());
			}
			return;
		}

		// Check if package includes cake and customer hasn't chosen one (only when on or past Cakes step)
		const cakeIndex = navOptions.findIndex((opt) => opt.toLowerCase() === "cakes");
		const pkgAddons = bookingState.package?.addons || [];
		const packageIncludesCake = Array.isArray(pkgAddons) && pkgAddons.some((a) => typeof a === "string" && a.toLowerCase().includes("cake"));
		const selectedCakesList = (bookingState.cakes || []).filter((c) => c && (c.count > 0 || c.free || c._id));
		if (activeIndex >= cakeIndex && packageIncludesCake && selectedCakesList.length === 0) {
			toast.error("Please select at least one cake (included in your package)");
			if (cakeIndex !== -1) {
				setActiveIndex(cakeIndex);
				navigate(navOptions[cakeIndex].toLowerCase());
			}
			return;
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

		if (loading || verificationLoading || createCustomerBookingMutation.isPending) {
			return;
		}

		// 1. Validate that screen, date, and slot exist in state
		if (!bookingState.screen || !bookingState.date || !bookingState.slot?.from || !bookingState.slot?.to) {
			toast.error("Please select a valid date and time slot first");
			navigate("/booking/slots");
			return;
		}

		// 2. Validate customer contact details
		const customerName = bookingState.customer?.name?.trim();
		const customerEmail = bookingState.customer?.email?.trim();
		const rawNumber = bookingState.customer?.number ? String(bookingState.customer.number).replace(/[\s-]/g, "") : "";

		if (!customerName || !customerEmail || !rawNumber) {
			toast.error("Please provide your contact details (Name, Email, and Phone) first");
			navigate("/booking/customerDetails");
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(customerEmail)) {
			toast.error("Please enter a valid email address");
			navigate("/booking/customerDetails");
			return;
		}

		if (!/^\+?[0-9]{10,15}$/.test(rawNumber)) {
			toast.error("Please enter a valid 10-digit phone number");
			navigate("/booking/customerDetails");
			return;
		}

		// 3. Validate package
		const packageName = typeof bookingState.package === "string" ? bookingState.package : (bookingState.package?.name || "");
		if (!packageName) {
			toast.error("Please select a Package to continue");
			const pkgIndex = navOptions.findIndex((opt) => opt.toLowerCase() === "packages");
			if (pkgIndex !== -1) {
				setActiveIndex(pkgIndex);
				navigate(navOptions[pkgIndex].toLowerCase());
			}
			return;
		}

		// 4. Validate occasion
		if (!bookingState.occasion?._id) {
			toast.error("Please select an Occasion to continue");
			const occIndex = navOptions.findIndex((opt) => opt.toLowerCase() === "occasions");
			if (occIndex !== -1) {
				setActiveIndex(occIndex);
				navigate(navOptions[occIndex].toLowerCase());
			}
			return;
		}

		try {
			setLoading(true);

			// 1. PRE-FLIGHT CHECK: Verify if slot is already booked, overlapping, or locked in checkout
			try {
				const slotCheck = await bookingsApi.checkSlotAvailability({
					screenId: bookingState.screen,
					date: bookingState.date,
					slot: bookingState.slot,
				});

				if (!slotCheck.available) {
					setLoading(false);
					setSlotAlert({
						open: true,
						title: slotCheck.reason === "locked" ? "Slot Currently in Checkout" : "Slot No Longer Available",
						message:
							slotCheck.message ||
							`The time slot (${bookingState.slot.from} – ${bookingState.slot.to}) is already booked or overlaps with an existing reservation. Please select another slot.`,
						slot: bookingState.slot,
						date: bookingState.date,
					});
					return;
				}
			} catch (checkErr) {
				console.warn("Slot pre-check network error, proceeding with order validation:", checkErr);
			}

			// 2. Format payload for createCustomerBooking matching backend schema
			const payload = {
				city: bookingState.city || undefined,
				location: bookingState.location || undefined,
				screen: bookingState.screen,
				date: bookingState.date,
				slot: bookingState.slot,
				package: {
					name: packageName,
				},
				occasion: {
					_id: bookingState.occasion._id,
					celebrantName: bookingState.occasion.celebrantName || "",
				},
				addons: (bookingState.addons || [])
					.filter((a) => a && a._id && (Number(a.count) || 0) > 0)
					.map((a) => ({ _id: a._id, count: Number(a.count) || 1 })),
				gifts: (bookingState.gifts || [])
					.filter((g) => g && g._id && (Number(g.count) || 0) > 0)
					.map((g) => ({ _id: g._id, count: Number(g.count) || 1 })),
				cakes: (bookingState.cakes || [])
					.filter((c) => c && c._id)
					.map((c) => ({ _id: c._id, free: Boolean(c.free) })),
				customer: {
					name: customerName,
					email: customerEmail,
					number: rawNumber,
				},
				otherInfo: {
					numberOfPeople: Number(bookingState.otherInfo?.numberOfPeople) || 0,
					numberOfExtraPeople: Number(bookingState.otherInfo?.numberOfExtraPeople) || 0,
					nameOnCake: bookingState.otherInfo?.nameOnCake || "",
					ledName: bookingState.otherInfo?.ledName || "",
					ledNumber: bookingState.otherInfo?.ledNumber || "",
					couponCode: bookingState.otherInfo?.couponCode || null,
				},
				advance: Number(bookingState.advance) || 0,
				note: bookingState.note || "",
			};

			const result = await createCustomerBookingMutation.mutateAsync(payload);
			const { booking, razorpayOrderId } = result;

			setLoading(false);

			if (razorpayOrderId) {
				try {
					const paymentResponse = await openRazorpayCheckout({
						orderId: razorpayOrderId,
						amountPaise: Math.round((booking.totalPrice || bookingState.total || 0) * 100),
						customerName,
						customerEmail,
						customerNumber: rawNumber,
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
					// Immediately cancel pending booking on backend to release Redis slot lock
					await cancelPayment(razorpayOrderId).catch((cancelErr) => {
						console.error("Failed to cancel order:", cancelErr);
					});
					setVerificationLoading(false);
					toast.error(err.message || "Payment cancelled. You can retry booking anytime.");
				}
			}
		} catch (error) {
			setLoading(false);
			console.error("Booking error:", error);

			const errMsg = error.message || "";
			const isSlotConflict =
				error.status === 409 ||
				errMsg.toLowerCase().includes("slot") ||
				errMsg.toLowerCase().includes("booked") ||
				errMsg.toLowerCase().includes("checkout");

			if (isSlotConflict) {
				setSlotAlert({
					open: true,
					title: "Slot No Longer Available",
					message: errMsg || "This time slot is already booked or conflicts with another reservation. Please choose another slot.",
					slot: bookingState.slot,
					date: bookingState.date,
				});
			} else {
				toast.error(errMsg || "Something went wrong while initiating booking");
			}
		}
	}

	function handleChooseAnotherSlot() {
		// Clear invalid slot from booking store
		bookingState.setBookingSlot({ from: "", to: "" });

		// Invalidate cached slots so Slots page loads latest availability
		queryClient.invalidateQueries({ queryKey: ["bookings", "slots"] });

		// Close alert modal
		setSlotAlert({ open: false, title: "", message: "", slot: null, date: null });

		// Navigate back to slots selection step
		navigate("/booking/slots");
	}

	const isProcessing = loading || verificationLoading || createCustomerBookingMutation.isPending;

	return (
		<>
			{isProcessing && (
				<div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
					<Loader />
				</div>
			)}

			<button
				className="btn-3 text-center flex w-full items-center justify-center gap-2 m-auto"
				onClick={handleNext}
				disabled={isProcessing}
			>
				{activeIndex < navOptions.length - 1 ? "Next" : "Payment"} <FaArrowRight className="text-xs" />
			</button>

			{/* Slot Unavailable Alert Dialog Modal */}
			{slotAlert.open && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
					<div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-gray-100 transform transition-all animate-scaleUp">
						<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center text-2xl shadow-sm">
							<FaExclamationTriangle />
						</div>

						<h3 className="text-xl font-bold text-gray-900 mb-2">
							{slotAlert.title || "Slot No Longer Available"}
						</h3>

						<p className="text-sm text-gray-600 mb-5 leading-relaxed">
							{slotAlert.message}
						</p>

						{(slotAlert.date || slotAlert.slot) && (
							<div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-6 text-left text-xs text-slate-700 space-y-2">
								{slotAlert.date && (
									<div className="flex items-center gap-2">
										<FaCalendarAlt className="text-slate-400 text-sm" />
										<span>
											Date: <strong>{new Date(slotAlert.date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</strong>
										</span>
									</div>
								)}
								{slotAlert.slot?.from && (
									<div className="flex items-center gap-2">
										<FaClock className="text-slate-400 text-sm" />
										<span>
											Selected Slot: <strong className="text-red-500 line-through mr-1">{slotAlert.slot.from} – {slotAlert.slot.to}</strong>
											<span className="text-red-600 font-semibold">(Unavailable)</span>
										</span>
									</div>
								)}
							</div>
						)}

						<div className="flex flex-col gap-2.5">
							<button
								type="button"
								onClick={handleChooseAnotherSlot}
								className="w-full py-3 px-5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#6461ae] to-[#c779d3] hover:opacity-95 shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
							>
								Choose Another Slot <FaArrowRight className="text-xs" />
							</button>

							<button
								type="button"
								onClick={() => setSlotAlert({ open: false, title: "", message: "", slot: null, date: null })}
								className="text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors cursor-pointer"
							>
								Dismiss
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default OtherDetailsButton;

