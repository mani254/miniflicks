import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { getBooking } from "../../redux/booking/bookingActions";
import { useParams } from "react-router-dom";
import Loader from "../Loader/Loader";
import DetailedBooking from "./DetailedBooking";

function DetailedView({ bookingsData, getBooking }) {
	console.log(bookingsData);
	const { id } = useParams();

	useEffect(() => {
		async function fetchBooking() {
			try {
				await getBooking(id);
			} catch (err) {
				console.log(err);
			}
		}
		fetchBooking();
	}, []);

	return (
		<div>
			{bookingsData.loading && (
				<div className="h-96">
					<Loader />
				</div>
			)}
			{bookingsData?.booking ? <DetailedBooking bookingData={bookingsData.booking} /> : <DetailedBooking />}
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		bookingsData: state.bookings,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		getBooking: (id) => dispatch(getBooking(id)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailedView);
