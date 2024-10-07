import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Loader from "../Loader/Loader.jsx";
import Switch from "../Switch/Switch.jsx";
import { connect } from "react-redux";
import { showModal } from "../../redux/modal/modalActions.js";
import { deleteBanner, changeBannerStatus } from "../../redux/banner/bannerActions.js"; // Adjust the import
import ConfirmationAlert from "../ConfirmationAlert/ConfirmationAlert.jsx";

function Banners({ showModal, deleteBanner, changeBannerStatus }) {
	const navigate = useNavigate();
	const bannersData = useOutletContext();

	const alertData = {
		title: "Are You sure?",
		info: "Deleting this banner cannot be undone.",
		confirmFunction: (bannerId) => {
			deleteBanner(bannerId);
		},
	};

	async function handleStatusChange(banner) {
		try {
			await changeBannerStatus(banner._id, !banner.status);
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<div className="w-full container px-6 mt-3">
			<div className="flex justify-between pb-2 border-b border-gray-400">
				<h3>Banners</h3>
				<button className="btn" onClick={() => navigate("/admin/banners/add")}>
					Add Banner
				</button>
			</div>
			{bannersData.loading ? (
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
								<th>Link</th>
								<th>Position</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{bannersData.banners.length >= 1 &&
								bannersData.banners.map((banner, index) => (
									<tr key={banner._id}>
										<td>{index + 1}</td>
										<td>
											<div className="relative w-12 h-12 overflow-hidden bg-green-200 rounded-md">
												<img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
											</div>
										</td>
										<td>{banner.link}</td>
										<td>{banner.position}</td>
										<td>
											<Switch status={banner.status} id={banner._id} changeHandler={() => handleStatusChange(banner)} />
										</td>
										<td>
											<div className="flex">
												<span className="mr-3 cursor-pointer text-2xl" onClick={() => navigate(`/admin/banners/edit/${banner._id}`)}>
													<FaEdit className="fill-blue-500" />
												</span>
												<span className="cursor-pointer text-2xl" onClick={() => showModal({ ...alertData, id: banner._id }, ConfirmationAlert)}>
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
		deleteBanner: (bannerId) => dispatch(deleteBanner(bannerId)),
		changeBannerStatus: (id, status) => dispatch(changeBannerStatus(id, status)),
	};
};

export default connect(null, mapDispatchToProps)(Banners);
