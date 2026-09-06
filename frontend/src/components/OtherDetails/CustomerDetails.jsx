import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "../../store/bookingStore";
import { useScreen } from "../../hooks/useCatalog";
import { showModal } from "../../store/modalStore";
import toast from "react-hot-toast";

import termsAndConditions from "../../utils/termsAndConditions";
import refundPolicy from "../../utils/refundPolicy";
import Popupts from "../popupts/Popupts";

function CustomerDetails() {
	const navigate = useNavigate();
	const {
		screen: selectedScreenId,
		date: bookingDate,
		customer: currentCustomer,
		otherInfo: currentOtherInfo,
		setBookingCustomer,
		setBookingOtherInfo,
	} = useBookingStore();

	const { data: screen } = useScreen(selectedScreenId);

	const [details, setDetails] = useState({
		name: "",
		email: "",
		number: "",
		numberOfPeople: 0,
		termsAccepted: false,
	});
	const [todayPrice, setTodayPrice] = useState(0);
	const [options, setOptions] = useState([]);

	// Hydrate from booking store
	useEffect(() => {
		if (currentCustomer || currentOtherInfo) {
			setDetails({
				name: currentCustomer?.name || "",
				email: currentCustomer?.email || "",
				number: currentCustomer?.number || "",
				numberOfPeople: currentOtherInfo?.numberOfPeople || 0,
				termsAccepted: true,
			});
		}
	}, [currentCustomer, currentOtherInfo]);

	// Handle input changes
	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setDetails((prevDetails) => ({
			...prevDetails,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	function getTodayPrice(pack) {
		if (!pack) return 0;
		const selectedDate = new Date(bookingDate).toISOString().split("T")[0];

		const customFound = pack.customPrice?.find((custom) => {
			const customDate = new Date(custom.date).toISOString().split("T")[0];
			return customDate === selectedDate;
		});

		return customFound ? customFound.price : pack.price;
	}

	useEffect(() => {
		if (!screen?.minPeople || !screen?.capacity) return;

		const opts = Array.from({ length: screen.capacity - screen.minPeople + 1 }, (_, i) => i + screen.minPeople);
		setOptions(opts);

		if (details.numberOfPeople === 0) {
			setDetails((prev) => ({ ...prev, numberOfPeople: screen.minPeople }));
		}

		if (screen?.packages?.length) {
			let pack = screen.packages[0];
			let price = getTodayPrice(pack);
			setTodayPrice(price);
		}
	}, [screen, bookingDate]);

	// Handle form submission
	function handleSubmit(e) {
		e.preventDefault();

		if (!details.email.endsWith("@gmail.com")) {
			toast.error("Invalid Gmail ID");
			return;
		}

		setBookingCustomer({ name: details.name, email: details.email, number: details.number });

		const numberOfExtraPeople = Math.max(0, Number(details.numberOfPeople) - (screen?.minPeople || 0));
		const extraPersonsPrice = numberOfExtraPeople * (screen?.extraPersonPrice || 0);

		setBookingOtherInfo({
			...currentOtherInfo,
			numberOfPeople: Number(details.numberOfPeople),
			numberOfExtraPeople,
			extraPersonsPrice,
		});

		navigate("/booking/otherdetails/packages");
	}

	function showPopUP(title, array) {
		showModal({ title, array }, Popupts);
	}

	return (
		<div style={{ height: "calc(100vh - 60px)" }} className="w-full flex items-center justify-center">
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
				{options.length > 1 && (
					<div className="input-wrapper">
						<label htmlFor="numberOfPeople">Number Of People</label>
						<select id="numberOfPeople" name="numberOfPeople" value={details.numberOfPeople} onChange={handleChange} required>
							{options.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>
				)}
				{screen?.minPeople != screen?.capacity && (
					<p className="font-light">
						Additional charge of {screen?.extraPersonPrice} per person for any number exceeding {screen?.minPeople} people
					</p>
				)}

				<div className="input-wrapper flex mt-6">
					<input type="checkbox" id="terms" name="termsAccepted" checked={details.termsAccepted} onChange={handleChange} required />
					<label className="ml-2 -mt-1 text-xs">
						I accept the{" "}
						<span className="text-primary cursor-pointer text-xs" onClick={() => showPopUP("Terms And Conditions", termsAndConditions)}>
							terms and conditions
						</span>{" "}
						and the{" "}
						<span onClick={() => showPopUP("Refund Policy", refundPolicy)} className="text-primary cursor-pointer text-xs">
							refund policy
						</span>
					</label>
				</div>

				<div className="flex items-center gap-8 mt-4">
					{screen?.minPeople && <h2 className="whitespace-nowrap"> ₹ {todayPrice + (Number(details.numberOfPeople) - screen?.minPeople) * (screen?.extraPersonPrice || 0)}</h2>}
					<div className="book-now-btn w-full">
						<button className="btn-3 text-center w-full items-center gap-2 m-auto" type="submit">
							Proceed <FaArrowRight />
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}

export default CustomerDetails;
