import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { createBooking,updateBooking} from "../redux/booking/bookingActions";
import { useNavigate } from "react-router-dom";
import { setBookingAdvance, setBookingNote,setBookingFullPayment } from "../redux/customerBooking/customerBookingActions";
import Loader from "../components/Loader/Loader";

function paymentPage({ customerBooking, createBooking , updateBooking}) {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const [details, setDetails] = useState({
		advance: 0,
		note: "",
		total: 0,
		fullPayment:false
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!customerBooking) return;
		setDetails({ advance: customerBooking.advance, note: customerBooking.note, total: customerBooking.total,fullPayment:customerBooking.fullPayment });
	}, [customerBooking]);


	function handleChange(e) {
		const { name, type, value, checked } = e.target;
	
		const newValue = type === "checkbox" ? checked : value;
	
		setDetails((prev) => ({ ...prev, [name]: newValue }));
	
		if (name === "advance") {
			dispatch(setBookingAdvance(newValue));
		}
		if (name === "note") {
			dispatch(setBookingNote(newValue));
		}
		if(name=="fullPayment"){
			dispatch(setBookingFullPayment(newValue))
		}

	}

	console.log(details)

	async function handleBooking() {
		try {
			setLoading(true);
			const res = await createBooking(customerBooking);

			if (res) {
				console.log(res);
				setLoading(false);
				navigate("/bookingConfirmation", { replace: true });
			}
		} catch (err) {
			setLoading(false);
			console.log(err);
		}
	}

	async function handleUpdateBooking() {
		try {
			setLoading(true);
			const res = await updateBooking(customerBooking);

			if (res) {
				console.log(res);
				setLoading(false);
				navigate("/bookingConfirmation", { replace: true });
			}
		} catch (err) {
			setLoading(false);
			console.log(err);
		}
	}



	function handleSubmit(e) {
		e.preventDefault();
		if(!customerBooking.isEditing){
			handleBooking();
		}
		else{
			handleUpdateBooking();
		}
	}

	return (
		<div style={{ height: "calc(100vh - 60px)" }} className="w-full flex flex-col items-center justify-center">
			{loading && (
				<div className="fixed inset-0 bg-black bg-opacity-30 z-50">
					<Loader />
				</div>
			)}
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

					{customerBooking.isEditing && (
						<div className="input-wrapper flex mt-6">
						<input type="checkbox" id="fullPayment" name="fullPayment" checked={details.fullPayment} onChange={handleChange}/>
						<label className="ml-2 -mt-1" htmlFor="fullPayment">
							Payment Completed
						</label>
					</div>
					)}


					<div className="flex mb-3 items-center justify-between">
						<h4>
							Total: <span className="text-gray-600 text-md">₹ {details.total}</span>{" "}
						</h4>
						<h4>
							Remaining: {details.fullPayment?<span className="text-gray-600 text-md">₹ 0</span>:<span className="text-gray-600 text-md">₹ {parseFloat((details.total - details.advance).toFixed(2))}</span>}
						</h4>
					</div>

					<div className="book-now-btn w-full">
						<button className="btn-3 text-center w-full items-center gap-2 m-auto" type="submit">
							{customerBooking.isEditing ?"Update Booking" :"Book Slot"}
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
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		createBooking: (booking) => dispatch(createBooking(booking)),
		updateBooking:(booking)=> dispatch(updateBooking(booking))
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(paymentPage);
