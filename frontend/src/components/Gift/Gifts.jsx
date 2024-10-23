import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Loader from "../Loader/Loader.jsx";
import { connect } from "react-redux";
import { showModal } from "../../redux/modal/modalActions.js";
import { deleteGift } from "../../redux/gift/giftActions.js";
import ConfirmationAlert from "../ConfirmationAlert/ConfirmationAlert.jsx";
import Pagination from "../Pagination/Pagination.jsx";
import GiftsFilter from "./GiftsFilter.jsx";

function Gifts({ showModal, deleteGift, auth }) {
	const [currentPage, setCurrentPage] = useState(1);

	const navigate = useNavigate();
	const { giftsData, noOfDocuments, params, setParams } = useOutletContext();

	const alertData = {
		title: "Are You sure?",
		info: "Deleting this gift cannot be undone.",
		confirmFunction: (giftId) => {
			deleteGift(giftId);
		},
	};

	return (
		<div className="w-full container px-6 mt-3">
			<div className="flex justify-between pb-2 border-b border-gray-400">
				<h3>Gifts</h3>
				<div>
					<GiftsFilter params={params} setParams={setParams} auth={auth} />
				</div>
				<button className="btn" onClick={() => navigate("/admin/gifts/add")}>
					Add Gift
				</button>
			</div>
			{giftsData.loading ? (
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
								{auth.admin?.superAdmin && <th>Actions</th>}
							</tr>
						</thead>
						<tbody>
							{giftsData.gifts.length >= 1 &&
								giftsData.gifts.map((gift, index) => (
									<tr key={gift._id}>
										<td>{index + 1}</td>
										<td>
											<div className="relative w-12 h-12 overflow-hidden bg-green-200 rounded-md">
												<img src={gift.image} alt={gift.name} className="w-full h-full object-cover" />
											</div>
										</td>
										<td>{gift.name}</td>
										<td>{gift.position}</td>
										<td>{gift.price}</td>
										{auth.admin?.superAdmin && (
											<td>
												<div className="flex">
													<span className="mr-3 cursor-pointer text-2xl" onClick={() => navigate(`/admin/gifts/edit/${gift._id}`)}>
														<FaEdit className="fill-blue-500" />
													</span>
													<span className="cursor-pointer text-2xl" onClick={() => showModal({ ...alertData, id: gift._id }, ConfirmationAlert)}>
														<MdDelete className="fill-red-500" />
													</span>
												</div>
											</td>
										)}
									</tr>
								))}
						</tbody>
					</table>
					<Pagination noOfDocuments={noOfDocuments} limit={10} currentPage={currentPage} setCurrentPage={setCurrentPage} params={params} setParams={setParams} />
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
		deleteGift: (giftId) => dispatch(deleteGift(giftId)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Gifts);
