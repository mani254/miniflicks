import React, { useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Loader from "../Loader/Loader.jsx";
import { connect } from "react-redux";
import { showModal } from "../../redux/modal/modalActions.js";
import { deleteCake } from "../../redux/cake/cakeActions.js";
import ConfirmationAlert from "../ConfirmationAlert/ConfirmationAlert.jsx";
import Pagination from "../Pagination/Pagination.jsx";
import GiftsFilter from "../Gift/GiftsFilter.jsx";

function Cakes({ showModal, deleteCake, auth }) {
	const [currentPage, setCurrentPage] = useState(1);

	const navigate = useNavigate();
	const { cakeData, noOfDocuments, params, setParams } = useOutletContext();

	const alertData = {
		title: "Are You sure?",
		info: "Deleting this cake cannot be undone.",
		confirmFunction: (cakeId) => {
			deleteCake(cakeId);
		},
	};

	return (
		<div className="w-full container px-6 mt-3">
			<div className="flex justify-between pb-2 border-b border-gray-400">
				<h3>Cakes</h3>
				<div>
					<GiftsFilter params={params} setParams={setParams} auth={auth} />
				</div>
				<button className="btn" onClick={() => navigate("/admin/cakes/add")}>
					Add Cake
				</button>
			</div>
			{cakeData.loading ? (
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
							{cakeData.cakes.length >= 1 &&
								cakeData.cakes.map((cake, index) => (
									<tr key={cake._id}>
										<td>{index + 1}</td>
										<td>
											<div className="relative w-12 h-12 overflow-hidden bg-green-200 rounded-md">
												<img src={cake.image} alt={cake.name} className="w-full h-full object-cover" />
											</div>
										</td>
										<td>{cake.name}</td>
										<td>{cake.position}</td>
										<td>{cake.price}</td>
										{auth.admin?.superAdmin && (
											<td>
												<div className="flex">
													<span className="mr-3 cursor-pointer text-2xl" onClick={() => navigate(`/admin/cakes/edit/${cake._id}`)}>
														<FaEdit className="fill-blue-500" />
													</span>
													<span className="cursor-pointer text-2xl" onClick={() => showModal({ ...alertData, id: cake._id }, ConfirmationAlert)}>
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
		deleteCake: (cakeId) => dispatch(deleteCake(cakeId)), // Adjust action for cake
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Cakes);
