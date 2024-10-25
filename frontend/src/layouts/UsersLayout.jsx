import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import { useDispatch } from "react-redux";
import { connect } from "react-redux";
import { getLocations } from "../redux/location/locationActions";

function UsersLayout({ customerBooking }) {
	const dispatch = useDispatch();

	useEffect(() => {
		if (!customerBooking.city) return;
		async function fetchLocations() {
			try {
				await dispatch(getLocations(customerBooking.city));
			} catch (err) {
				console.log(err);
			}
		}
		fetchLocations();
	}, [customerBooking.city]);

	return (
		<main>
			<Header />
			<div className="container m-auto max-w-[1350px]">
				<Outlet />
			</div>
		</main>
	);
}

const mapStateToProps = (state) => {
	return {
		customerBooking: state.customerBooking,
	};
};

export default connect(mapStateToProps, null)(UsersLayout);
