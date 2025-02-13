import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { connect, useDispatch } from "react-redux";

import { setBookingFromLocalStorage } from "../redux/customerBooking/customerBookingActions";
import { getScreens } from "../redux/screen/screenActions";
import { initialLogin } from "../redux/auth/authActions";

import { Helmet } from "react-helmet-async";

function UsersLayout({ customerBooking, initialLogin }) {
	const dispatch = useDispatch();

	useEffect(() => {
		const fetchInitialData = async () => {
			try {
				const token = localStorage.getItem("authToken");
				if (token) {
					await initialLogin(token);
				}
			} catch (err) {
				console.log(err);
			}
		};
		fetchInitialData();
	}, []);

	useEffect(() => {
		const savedBookingData = localStorage.getItem("customerBooking");
		if (savedBookingData) {
			const bookingData = JSON.parse(savedBookingData);
			// console.log(bookingData);
			dispatch(setBookingFromLocalStorage(bookingData));
		}
	}, []);

	// useEffect to fetch the screens wheen there is a change in the location
	useEffect(() => {
		if (!customerBooking.location) return;
		async function fetchScreens() {
			try {
				await dispatch(getScreens(customerBooking.location));
			} catch (err) {
				console.log(err);
			}
		}
		fetchScreens();
	}, [customerBooking.location]);

	return (
		<>
			<Helmet>
				<title>Book Miniflicks | Your Private Theatre Awaits</title>
				<meta name="description" content="Reserve Miniflicks for an exclusive private theatre experience. Check availability and book for movie nights, parties, birthdays, and customized celebrations with ease." />
				<meta name="keywords" content="book Miniflicks, private theatre booking, movie night reservations, luxury theatre rental, party venue booking, customized celebrations" />
				<meta property="og:title" content="Book Miniflicks | Your Private Theatre Awaits" />
				<meta property="og:description" content="Secure your private theatre experience at Miniflicks. Book for birthdays, parties, or movie nights with personalized themes and luxury amenities." />
				<meta property="og:image" content="https://miniflicks.in/decoration.webp" />
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://miniflicks.in/booking/locations" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content="Book Miniflicks | Your Private Theatre Awaits" />
				<meta name="twitter:description" content="Reserve Miniflicks for an unforgettable private theatre experience. Perfect for celebrations and movie nights with Dolby Atmos and luxurious seating." />
				<meta name="twitter:image" content="https://miniflicks.in/decoration.webp" />
			</Helmet>
			<div className="container m-auto max-w-[1350px]">
				<Outlet />
			</div>
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
		initialLogin: (token) => dispatch(initialLogin(token)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersLayout);
