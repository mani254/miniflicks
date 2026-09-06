import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "../store/bookingStore";
import { useCreateAdminBooking, useUpdateBooking } from "../hooks/useBookings";
import Loader from "../components/Loader/Loader";

function PaymentPage() {
	const navigate = useNavigate();
	const bookingState = useBookingStore();
	const {
		advance: storeAdvance,
		note: storeNote,
		total: storeTotal,
		fullPayment: storeFullPayment,
		isEditing,
		setBookingAdvance,
		setBookingNote,
		setBookingFullPayment,
	} = bookingState;

	const createAdminBookingMutation = useCreateAdminBooking();
	const updateBookingMutation = useUpdateBooking();

	const [details, setDetails] = useState({
		advance: 0,
		note: "",
		total: 0,
		fullPayment: false,
	});

	useEffect(() => {
		setDetails({
			advance: storeAdvance || 0,
			note: storeNote || "",
			total: storeTotal || 0,
			fullPayment: Boolean(storeFullPayment),
		});
	}, [storeAdvance, storeNote, storeTotal, storeFullPayment]);

	function handleChange(e) {
		const { name, type, value, checked } = e.target;
		const newValue = type === "checkbox" ? checked : value;

		setDetails((prev) => ({ ...prev, [name]: newValue }));

		if (name === "advance") {
			setBookingAdvance(Number(newValue) || 0);
		}
		if (name === "note") {
			setBookingNote(newValue);
		}
		if (name === "fullPayment") {
			setBookingFullPayment(newValue);
		}
	}

	async function handleBooking() {
		try {
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
				advance: Number(details.advance) || 0,
				note: details.note || "",
			};

			const res = await createAdminBookingMutation.mutateAsync(payload);
			if (res) {
				navigate("/bookingConfirmation", { replace: true });
			}
		} catch (err) {
			console.error("Admin booking creation error:", err);
		}
	}

	async function handleUpdateBooking() {
		try {
			const payload = {
				id: bookingState.id,
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
				customer: bookingState.customer,
				otherInfo: {
					numberOfPeople: bookingState.otherInfo?.numberOfPeople || 0,
					numberOfExtraPeople: bookingState.otherInfo?.numberOfExtraPeople || 0,
					nameOnCake: bookingState.otherInfo?.nameOnCake || "",
					ledName: bookingState.otherInfo?.ledName || "",
					ledNumber: bookingState.otherInfo?.ledNumber || "",
					couponCode: bookingState.otherInfo?.couponCode || null,
				},
				advance: Number(details.advance) || 0,
				note: details.note || "",
				fullPayment: Boolean(details.fullPayment),
			};

			const res = await updateBookingMutation.mutateAsync(payload);
			if (res) {
				navigate("/bookingConfirmation", { replace: true });
			}
		} catch (err) {
			console.error("Booking update error:", err);
		}
	}

	function handleSubmit(e) {
		e.preventDefault();
		if (!isEditing) {
			handleBooking();
		} else {
			handleUpdateBooking();
		}
	}

	const isLoading = createAdminBookingMutation.isPending || updateBookingMutation.isPending;

	return (
		<div style={{ height: "calc(100vh - 60px)" }} className="w-full flex flex-col items-center justify-center">
			{isLoading && (
				<div className="fixed inset-0 bg-black bg-opacity-30 z-50">
					<Loader />
				</div>
			)}
			{bookingState && (
				<form className="w-full max-w-[400px] bg-white p-5 rounded-lg shadow-md customer-details" onSubmit={handleSubmit}>
					<div className="input-wrapper">
						<label htmlFor="advance">Advance</label>
						<input type="number" id="advance" name="advance" placeholder="Enter Advance Amount" value={details.advance} onChange={handleChange} required />
					</div>

					<div className="input-wrapper">
						<label htmlFor="note">Note</label>
						<textarea id="note" name="note" placeholder="Add any special notes" value={details.note} onChange={handleChange} />
					</div>

					{isEditing && (
						<div className="input-wrapper flex mt-6">
							<input type="checkbox" id="fullPayment" name="fullPayment" checked={details.fullPayment} onChange={handleChange} />
							<label className="ml-2 -mt-1" htmlFor="fullPayment">
								Payment Completed
							</label>
						</div>
					)}

					<div className="flex mb-3 items-center justify-between">
						<h4>
							Total: <span className="text-gray-600 text-md">₹ {details.total}</span>{" "}
						</h4>
						<h4>Remaining: {details.fullPayment ? <span className="text-gray-600 text-md">₹ 0</span> : <span className="text-gray-600 text-md">₹ {parseFloat((details.total - details.advance).toFixed(2))}</span>}</h4>
					</div>

					<div className="book-now-btn w-full">
						<button className="btn-3 text-center w-full items-center gap-2 m-auto" type="submit" disabled={isLoading}>
							{isEditing ? "Update Booking" : "Book Slot"}
						</button>
					</div>
				</form>
			)}
		</div>
	);
}

export default PaymentPage;
