import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { connect, useDispatch } from "react-redux";

import { setBookingFromLocalStorage } from "../redux/customerBooking/customerBookingActions";
import { getScreens } from "../redux/screen/screenActions";

function UsersLayout({ customerBooking }) {
	const dispatch = useDispatch();

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

	return <Outlet />;
}

const mapStateToProps = (state) => {
	return {
		customerBooking: state.customerBooking,
	};
};

export default connect(mapStateToProps, null)(UsersLayout);
