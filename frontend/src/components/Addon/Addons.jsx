import React, { useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Loader from "../Loader/Loader.jsx";
import { connect } from "react-redux";
import { showModal } from "../../redux/modal/modalActions.js";
import { deleteAddon } from "../../redux/addon/addonActions.js";
import ConfirmationAlert from "../ConfirmationAlert/ConfirmationAlert.jsx";

function Addons({ showModal, deleteAddon }) {
	const navigate = useNavigate();
	const addonsData = useOutletContext();

	const alertData = {
		title: "Are You sure?",
		info: "Deleting this addon cannot be undone.",
		confirmFunction: (addonId) => {
			deleteAddon(addonId);
		},
	};

	return (
		<div className="w-full container px-6 mt-3">
			<div className="flex justify-between pb-2 border-b border-gray-400">
				<h3>Addons</h3>
				<button className="btn" onClick={() => navigate("/admin/addons/add")}>
					Add Addon
				</button>
			</div>
			{addonsData.loading ? (
				<div className="h-96 relative">
					<Loader />
				</div>
			) : (
				<div className="h-96 relative">
					<table className="main-table">
						<thead>
							<tr>
								<th>S.NO</th>
								<th>Image</th>
								<th>Name</th>
								<th>Position</th>
								<th>Price</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{addonsData.addons.length >= 1 &&
								addonsData.addons.map((addon, index) => (
									<tr key={addon._id}>
										<td>{index + 1}</td>
										<td>
											<div className="relative w-12 h-12 overflow-hidden bg-green-200 rounded-md">
												<img src={addon.image} alt={addon.name} className="w-full h-full object-cover" />
											</div>
										</td>
										<td>{addon.name}</td>
										<td>{addon.position}</td>
										<td>{addon.price}</td>
										<td>
											<div className="flex">
												<span className="mr-3 cursor-pointer text-2xl" onClick={() => navigate(`/admin/addons/edit/${addon._id}`)}>
													<FaEdit className="fill-blue-500" />
												</span>
												<span className="cursor-pointer text-2xl" onClick={() => showModal({ ...alertData, id: addon._id }, ConfirmationAlert)}>
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
		deleteAddon: (addonId) => dispatch(deleteAddon(addonId)),
	};
};

export default connect(null, mapDispatchToProps)(Addons);
