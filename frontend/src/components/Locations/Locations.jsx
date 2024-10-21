import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Loader from "../Loader/Loader.jsx";
import Switch from "../Switch/Switch.jsx";

import { connect } from "react-redux";
import { showModal } from "../../redux/modal/modalActions";
import { deleteLocation, changeLocationStatus } from "../../redux/location/locationActions";
import ConfirmationAlert from "../ConfirmationAlert/ConfirmationAlert.jsx";

function Locations({ showModal, deleteLocation, changeLocationStatus, auth }) {
	const navigate = useNavigate();
	const locationsData = useOutletContext();

	const alertData = {
		title: "Are You sure?",
		info: "If you Delete this Locations All the screens will be unallocated",
		confirmFunction: (locationId) => {
			deleteLocation(locationId);
		},
	};

	async function handleStatusChange(location) {
		try {
			await changeLocationStatus(location._id, !location.status);
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<div className="w-full container  px-6 mt-3">
			<div className="flex justify-between pb-2 border-b border-gray-400">
				<h3>Locations</h3>
				{auth.admin?.superAdmin && (
					<button className="btn" onClick={() => navigate("/admin/locations/add")}>
						Add Locatins
					</button>
				)}
			</div>
			{locationsData.loading ? (
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
								<th>City</th>
								<th>admin</th>
								<th>Number</th>
								<th>Email</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{locationsData.locations.length >= 1 &&
								locationsData.locations.map((location, index) => (
									<tr key={location._id}>
										<td>{index + 1}</td>
										<td>{location.name}</td>
										<td className={`${location.city?.name ? "" : "text-gray-500"}`}>{location.city?.name || "Unallocated"}</td>
										<td>{location.admin.name}</td>
										<td>{location.admin.number}</td>
										<td>{location.admin.email}</td>
										<td>
											<Switch status={location.status} id={location._id} changeHandler={() => handleStatusChange(location)} />
										</td>
										<td>
											<div className="flex">
												<span className="mr-3 cursor-pointer text-2xl" onClick={() => navigate(`/admin/locations/edit/${location._id}`)}>
													<FaEdit className="fill-blue-500" />
												</span>
												<span className="cursor-pointer text-2xl" onClick={() => showModal({ ...alertData, id: location._id }, ConfirmationAlert)}>
													<MdDelete className="fill-red-500" />
												</span>
											</div>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		auth: state.auth,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		showModal: (props, component) => dispatch(showModal(props, component)),
		deleteLocation: (locationId) => dispatch(deleteLocation(locationId)),
		changeLocationStatus: (locationId, status) => dispatch(changeLocationStatus(locationId, status)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Locations);
