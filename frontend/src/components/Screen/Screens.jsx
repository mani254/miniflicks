import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Loader from "../Loader/Loader.jsx";
import Switch from "../Switch/Switch.jsx";

import { connect } from "react-redux";
import { showModal } from "../../redux/modal/modalActions";
import { deleteScreen } from "../../redux/screen/screenActions.js";
import ConfirmationAlert from "../ConfirmationAlert/ConfirmationAlert.jsx";

function Screens({ showModal, deleteScreen }) {
	const navigate = useNavigate();
	const screensData = useOutletContext();

	const alertData = {
		title: "Are You sure?",
		info: "If you delete this screen, it will be permanently removed.",
		confirmFunction: (screenId) => {
			deleteScreen(screenId);
		},
	};

	async function handleStatusChange(screen) {
		try {
			await changeScreenStatus(screen._id, !screen.status);
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<div className="w-full container px-6 mt-3">
			<div className="flex justify-between pb-2 border-b border-gray-400">
				<h3>Screens</h3>
				<button className="btn" onClick={() => navigate("/admin/screens/add")}>
					Add Screen
				</button>
			</div>
			{screensData.loading ? (
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
								<th>Location</th>
								<th>Capacity</th>
								<th>Min People</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{screensData.screens.length >= 1 &&
								screensData.screens.map((screen, index) => (
									<tr key={screen._id}>
										<td>{index + 1}</td>
										<td>{screen.name}</td>
										<td>{screen.location.name}</td>
										<td>{screen.capacity}</td>
										<td>{screen.minPeople}</td>
										<td>
											<Switch status={screen.status} id={screen._id} changeHandler={() => handleStatusChange(screen)} />
										</td>
										<td>
											<div className="flex">
												<span className="mr-3 cursor-pointer text-2xl" onClick={() => navigate(`/admin/screens/edit/${screen._id}`)}>
													<FaEdit className="fill-blue-500" />
												</span>
												<span className="cursor-pointer text-2xl" onClick={() => showModal({ ...alertData, id: screen._id }, ConfirmationAlert)}>
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

const mapDispatchToProps = (dispatch) => {
	return {
		showModal: (props, component) => dispatch(showModal(props, component)),
		deleteScreen: (screenId) => dispatch(deleteScreen(screenId)),
		// changeScreenStatus: (screenId, status) => dispatch(changeScreenStatus(screenId, status)),
	};
};

export default connect(null, mapDispatchToProps)(Screens);
