import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Loader from "../Loader/Loader.jsx";
import { connect } from "react-redux";
import { showModal } from "../../redux/modal/modalActions.js";
import { deleteOccasion } from "../../redux/occasion/occasionActions.js";
import ConfirmationAlert from "../ConfirmationAlert/ConfirmationAlert.jsx";
import Pagination from "../Pagination/Pagination.jsx";
import GiftsFilter from "../Gift/GiftsFilter.jsx";

function Occasions({ showModal, deleteOccasion, auth }) {
	const [currentPage, setCurrentPage] = useState(1);

	const navigate = useNavigate();
	const { occasionData, noOfDocuments, params, setParams } = useOutletContext();

	const alertData = {
		title: "Are You sure?",
		info: "Deleting this occasion cannot be undone.",
		confirmFunction: (occasionId) => {
			deleteOccasion(occasionId);
		},
	};

	return (
		<div className="w-full container px-6 mt-3">
			<div className="flex justify-between pb-2 border-b border-gray-400">
				<h3>Occasions</h3>
				<div>
					<GiftsFilter params={params} setParams={setParams} auth={auth} />
				</div>
				<button className="btn" onClick={() => navigate("/admin/occasions/add")}>
					Add Occasion
				</button>
			</div>
			{occasionData.loading ? (
				<div className="h-96 relative">
					<Loader />
				</div>
			) : (
				<div className="relative">
					<table className="main-table">
						<thead>
							<tr>
								<th>S.NO</th>
								<th>Image</th>
								<th>Name</th>
								<th>Position</th>
								<th>Price</th>
								{auth.admin?.superAdmin && <th>Actions</th>}
							</tr>
						</thead>
						<tbody>
							{occasionData.occasions.length >= 1 &&
								occasionData.occasions.map((occasion, index) => (
									<tr key={occasion._id}>
										<td>{index + 1}</td>
										<td>
											<div className="relative w-12 h-12 overflow-hidden bg-green-200 rounded-md">
												<img src={occasion.image} alt={occasion.name} className="w-full h-full object-cover" />
											</div>
										</td>
										<td>{occasion.name}</td>
										<td>{occasion.position}</td>
										<td>{occasion.price}</td>
										{auth.admin?.superAdmin && (
											<td>
												<div className="flex">
													<span className="mr-3 cursor-pointer text-2xl" onClick={() => navigate(`/admin/occasions/edit/${occasion._id}`)}>
														<FaEdit className="fill-blue-500" />
													</span>
													<span className="cursor-pointer text-2xl" onClick={() => showModal({ ...alertData, id: occasion._id }, ConfirmationAlert)}>
														<MdDelete className="fill-red-500" />
													</span>
												</div>
											</td>
										)}
									</tr>
								))}
						</tbody>
					</table>
				</div>
			)}
			<Pagination noOfDocuments={noOfDocuments} limit={10} currentPage={currentPage} setCurrentPage={setCurrentPage} params={params} setParams={setParams} />
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
		deleteOccasion: (occasionId) => dispatch(deleteOccasion(occasionId)), // Adjusted to use deleteOccasion
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Occasions);
