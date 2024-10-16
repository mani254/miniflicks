import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import Loader from "../Loader/Loader";

import { connect } from "react-redux";
import { getBookings } from "../../redux/booking/bookingActions";
import { useSearchParams } from "react-router-dom";
import BookingsFilter from "./BookingsFilter";
import Pagination from "../Pagination/Pagination";

function Bookings({ getBookings, bookingData }) {
	const [params, setParams] = useSearchParams();
	const [currentPage, setCurrentPage] = useState(1);
	const [noOfDocuments, setNoOfDocuments] = useState(0);

	useEffect(() => {
		(async () => {
			try {
				const data = await getBookings(Object.fromEntries(params));
				console.log(data);
				setNoOfDocuments(data.totalDocuments);
			} catch (err) {
				console.log(err);
			}
		})();
	}, [params]);

	return (
		<div className="w-full container  px-6 mt-3">
			<div className="flex justify-between pb-2 border-b border-gray-400">
				<h3>Bookings</h3>
				<BookingsFilter params={params} setParams={setParams} />
			</div>
			{bookingData.loading ? (
				<div className="h-96 relative">
					<Loader />
				</div>
			) : (
				<div className="h-96 relative">
					<table className="main-table">
						<thead>
							<tr>
								<th>S.NO</th>
								<th>Name</th>
								<th>Phone no</th>
								<th>Screen</th>
								<th>Location</th>
								<th>Date</th>
								<th>Slot</th>
								<th>Total</th>
								<th>Advance</th>
								<th>Remaining</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{bookingData.bookings.length >= 1 &&
								bookingData.bookings.map((booking, index) => (
									<tr key={booking._id}>
										<td>{index + 1}</td>
										<td>{booking.customer.name}</td>
										<td>{booking.customer.number}</td>
										<td className={`${booking.screen?.name ? "" : "text-gray-500"}`}>{booking.screen?.name || "undefined"}</td>
										<td className={`${booking.location?.name ? "" : "text-gray-500"}`}>{booking.location?.name || "undefined"}</td>
										<td>{new Date(booking.bookingDate).toLocaleString()}</td>
										<td>{booking.bookingSlot.from + "-" + booking.bookingSlot.to}</td>
										<td>{booking.totalPrice}</td>
										<td>{booking.advancePrice}</td>
										<td>{booking.remainingAmount}</td>
										<td>{booking.status}</td>
										<td>
											<div className="flex">
												<span className="mr-3 cursor-pointer text-2xl" onClick={() => navigate(`/admin/locations/edit/${location._id}`)}>
													<FaEdit className="fill-blue-500" />
												</span>
											</div>
										</td>
									</tr>
								))}
						</tbody>
					</table>
					<Pagination noOfDocuments={noOfDocuments} limit={5} currentPage={currentPage} setCurrentPage={setCurrentPage} params={params} setParams={setParams} />
				</div>
			)}
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		bookingData: state.bookings,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		getBookings: (params) => dispatch(getBookings(params)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Bookings);
