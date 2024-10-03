import React from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Loader from "../Loader/Loader.jsx";
import Switch from "../Switch/Switch.jsx";

import { connect } from "react-redux";
import { showModal } from "../../redux/modal/modalActions";
import { deleteCity } from "../../redux/citiy/cityActions.js";
import ConfirmationAlert from "../ConfirmationAlert/ConfirmationAlert.jsx";

function Cities({ showModal, deleteCity, citiesData }) {
	const navigate = useNavigate();

	return (
		<div className="w-full container  px-6 mt-3">
			<div className="flex justify-between pb-2 border-b border-gray-400">
				<h3>Cities</h3>
				<button className="btn btn-1">Add City</button>
			</div>
			{citiesData.loading ? (
				<div className="h-96 relative">
					<Loader />
				</div>
			) : (
				<div className="h-96 relative">
					<table className="main-table admins">
						<thead>
							<th>S.NO</th>
							<th>Name</th>
							<th>Status</th>
							<th>Actions</th>
						</thead>
						<tbody>
							{citiesData.cities.length >= 1 &&
								citiesData.cities.map((city, index) => (
									<tr key={city._id}>
										<td>{index + 1}</td>
										<td>{city.name}</td>
										<td>
											<Switch status={city.status} id={city._id} />
										</td>
										<td>
											<div className="flex">
												<span className="mr-3 cursor-pointer text-2xl" onClick={() => navigate(`/admins/edit/${admin._id}`)}>
													<FaEdit className="fill-blue-500" />
												</span>
												<span className="cursor-pointer text-2xl" onClick={() => showModal({ ...alertData, id: admin._id }, ConfirmationAlert)}>
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
		citiesData: state.cities,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		showModal: () => dispatch(showModal()),
		deleteCity: (cityId) => dispatch(deleteCity(cityId)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Cities);
