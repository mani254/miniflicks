import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";

import { connect, useDispatch } from "react-redux";
import { setBookingCustomer, setBookingOtherInfo } from "../../redux/customerBooking/customerBookingActions";
import { useNavigate } from "react-router-dom";

function CustomerDetails({ customerBooking, screensData }) {
	const dispatch = useDispatch();
	const navigate = useNavigate(null);

	const [details, setDetails] = useState({
		name: "",
		email: "",
		number: "",
		numberOfPeople: 0,
		termsAccepted: false,
	});
	const [todayPrice, setTodayPrice] = useState(0);
	const [screen, setScreen] = useState({});
	const [options, setOptions] = useState([]);

	// useEffect that will fetch and set all the data
	useEffect(() => {
		if (!customerBooking.customer) return;
		const details = { ...customerBooking.customer, numberOfPeople: customerBooking.otherInfo.numberOfPeople, termsAccepted: true };
		setDetails(details);
	}, [customerBooking]);

	// function to handle the input change
	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setDetails((prevDetails) => ({
			...prevDetails,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	// useEffect to set the current screen on screen chang
	useEffect(() => {
		const currentScreen = screensData.screens.find((screen) => screen?._id == customerBooking.screen);
		setScreen(currentScreen);
	}, [customerBooking.screen, screensData.screens]);

	// useEffect that will noOfpeople options and fetch todays price
	useEffect(() => {
		if (!screen?.minPeople || !screen?.capacity) return;

		const options = Array.from({ length: screen.capacity - screen.minPeople + 1 }, (_, i) => i + screen.minPeople);
		setOptions(options);

		if (details.numberOfPeople === 0 && customerBooking) {
			setDetails((prev) => ({ ...prev, numberOfPeople: screen.minPeople }));
		}

		if (screen?.packages?.length) {
			const pack = screen.packages[0];
			const selectedDate = new Date(customerBooking.date).toISOString().split("T")[0];

			const todayPrice = pack.customPrice.find((custom) => {
				const customDate = new Date(custom.date).toISOString().split("T")[0];
				return customDate === selectedDate;
			});

			setTodayPrice(todayPrice ? todayPrice.price : pack.price);
		}
	}, [customerBooking.screen, screen]);

	// useEffect that will set the extraPersonPrice
	useEffect(() => {
		if (details.numberOfPeople === 0) return;
		dispatch(
			setBookingOtherInfo({
				...customerBooking.otherInfo,
				numberOfPeople: (details.details.numberOfPeople - screen?.minPeople) * screen?.extraPersonPrice,
			})
		);
	}, [details.numberOfPeople]);

	// function that will handle the submit
	function handleSubmit(e) {
		e.preventDefault();
		dispatch(setBookingCustomer({ name: details.name, email: details.email, number: details.number }));
		dispatch(setBookingOtherInfo({ ...customerBooking.otherInfo, numberOfPeople: details.numberOfPeople }));
		navigate("/booking/otherdetails/packages");
	}

	return (
		<div style={{ height: "calc(100vh - 60px)" }} className="w-full flex items-center justify-center">
			{customerBooking && (
				<form className="w-full max-w-[400px] bg-white p-5 rounded-lg shadow-md customer-details" onSubmit={handleSubmit}>
					<div className="input-wrapper">
						<label htmlFor="name">Name</label>
						<input type="text" id="name" name="name" placeholder="Customer Name" value={details.name} onChange={handleChange} required />
					</div>
					<div className="input-wrapper">
						<label htmlFor="email">Email</label>
						<input type="email" id="email" name="email" placeholder="Your Email" value={details.email} onChange={handleChange} required />
					</div>
					<div className="input-wrapper">
						<label htmlFor="number">Phone Number</label>
						<input type="tel" id="number" name="number" placeholder="Your Phone Number" value={details.number} onChange={handleChange} required minLength={10} maxLength={10} pattern="\d{10}" title="Please enter a 10-digit phone number" inputMode="numeric" />
					</div>
					<div className="input-wrapper">
						<label htmlFor="numberOfPeople">Number Of People</label>
						{options.length > 1 && (
							<select id="numberOfPeople" name="numberOfPeople" value={details.numberOfPeople} onChange={handleChange} required>
								{options.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						)}
					</div>
					{screen?.minPeople != screen?.capacity && (
						<p className="font-light">
							Additional charge of {screen?.extraPersonPrice} per person for any number exceeding {screen?.minPeople} people
						</p>
					)}

					<div className="input-wrapper flex mt-6">
						<input type="checkbox" id="terms" name="termsAccepted" checked={details.termsAccepted} onChange={handleChange} required />
						<label className="ml-2 -mt-1 text-xs">
							I accept the <span className="text-primary cursor-pointer text-xs">terms and conditions</span> and the <span className="text-primary cursor-pointer text-xs">refund policy</span>
						</label>
					</div>

					<div className="flex items-center gap-8 mt-4">
						{screen?.minPeople && <h2 className="whitespace-nowrap"> ₹ {todayPrice + (details.numberOfPeople - screen?.minPeople) * screen?.extraPersonPrice}</h2>}
						<div className="book-now-btn w-full">
							<button className="btn-3 text-center w-full items-center gap-2 m-auto" type="submit">
								Proceed <FaArrowRight />
							</button>
						</div>
					</div>
				</form>
			)}
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		customerBooking: state.customerBooking,
		screensData: state.screens,
	};
};

export default connect(mapStateToProps, null)(CustomerDetails);
