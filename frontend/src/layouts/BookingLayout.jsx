import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { connect, useDispatch } from "react-redux";

import { setBookingFromLocalStorage } from "../redux/customerBooking/customerBookingActions";
import { getScreens } from "../redux/screen/screenActions";
import { initialLogin } from "../redux/auth/authActions";

function UsersLayout({ customerBooking, auth, initialLogin }) {
	const dispatch = useDispatch();

	useEffect(() => {
		if (auth.isLoggedIn) return;

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

	// useeffect when when reloaded or rendered fetch the data from the local storeage and set in the redux
	useEffect(() => {
		const savedBookingData = localStorage.getItem("customerBooking");
		console.log(savedBookingData, "savedbookingdata");
		if (savedBookingData) {
			const bookingData = JSON.parse(savedBookingData);
			console.log(bookingData);
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
		<div className="container m-auto max-w-[1350px]">
			<Outlet />
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
		initialLogin: (token) => dispatch(initialLogin(token)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersLayout);
