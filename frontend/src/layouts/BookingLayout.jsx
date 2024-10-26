import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { connect } from "react-redux";
import { getLocations } from "../redux/location/locationActions";
import { setBookingLocation } from "../redux/customerBooking/customerBookingActions";

function UsersLayout({ customerBooking }) {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	useEffect(() => {
		if (!customerBooking.location) {
			return navigate("/booking/locations");
		}
	}, [customerBooking.location]);
	return <Outlet />;
}

const mapStateToProps = (state) => {
	return {
		customerBooking: state.customerBooking,
	};
};

export default connect(mapStateToProps, null)(UsersLayout);
