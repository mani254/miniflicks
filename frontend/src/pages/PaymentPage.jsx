import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { createBooking } from "../redux/booking/bookingActions";
import { useNavigate } from "react-router-dom";
import { setBookingAdvance, setBookingNote } from "../redux/customerBooking/customerBookingActions";

function paymentPage({ customerBooking, createBooking, auth }) {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const [details, setDetails] = useState({
		advance: 0,
		note: "",
		total: 0,
	});

	useEffect(() => {
		if (!customerBooking) return;
		setDetails({ advance: customerBooking.advance, note: customerBooking.note, total: customerBooking.total });
	}, [customerBooking]);

	useEffect(() => {
		if (auth.isLoggedIn) return;
		if (localStorage.getItem("authToken")) return;
		navigate("/paymentgateway", { replace: true });
	}, []);

	function handleChange(e) {
		const { name, value } = e.target;
		setDetails((prev) => ({ ...prev, [name]: value }));

		if (name === "advance") {
			dispatch(setBookingAdvance(value));
		}
		if (name === "note") {
			dispatch(setBookingNote(value));
		}
	}

	async function handleBooking() {
		try {
			const res = await createBooking(customerBooking);

			if (res) {
				console.log(res);
				navigate("/bookingConfirmation", { replace: true });
			}
		} catch (err) {
			console.log(err);
		}
	}

	function handleSubmit(e) {
		e.preventDefault();
		handleBooking();
	}

	return (
		<div style={{ height: "calc(100vh - 60px)" }} className="w-full flex flex-col items-center justify-center">
			{customerBooking && (
				<form className="w-full max-w-[400px] bg-white p-5 rounded-lg shadow-md customer-details" onSubmit={handleSubmit}>
					<div className="input-wrapper">
						<label htmlFor="advance">Advance</label>
						<input type="number" id="advance" name="advance" placeholder="Enter Advance Amount" value={details.advance} onChange={handleChange} required />
					</div>

					<div className="input-wrapper">
						<label htmlFor="note">Note</label>
						<textarea id="note" name="note" placeholder="Add any special notes" value={details.note} onChange={handleChange} />
					</div>

					<div className="book-now-btn w-full">
						<button className="btn-3 text-center w-full items-center gap-2 m-auto" type="submit">
							Book Slot
						</button>
					</div>
				</form>
			)}
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		customerBooking: state.customerBooking,
		auth: state.auth,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		createBooking: (booking) => dispatch(createBooking(booking)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(paymentPage);
