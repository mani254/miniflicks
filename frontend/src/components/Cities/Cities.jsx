import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Loader from "../Loader/Loader.jsx";
import Switch from "../Switch/Switch.jsx";

import { connect } from "react-redux";
import { showModal } from "../../redux/modal/modalActions";
import { deleteCity, updateCityStatus } from "../../redux/citiy/cityActions.js";
import ConfirmationAlert from "../ConfirmationAlert/ConfirmationAlert.jsx";

function Cities({ showModal, deleteCity, updateCityStatus }) {
	const navigate = useNavigate();

	const citiesData = useOutletContext();

	const alertData = {
		title: "Are You sure?",
		info: "If you Delete this city All the Locations will be unallocated",
		confirmFunction: (cityId) => {
			deleteCity(cityId);
		},
	};

	async function handleStatusChange(city) {
		city.status = !city.status;
		try {
			await updateCityStatus(city._id, city);
		} catch (err) {
			console.log(err);
		}
	}
	return (
		<div className="w-full container  px-6 mt-3">
			<div className="flex justify-between pb-2 border-b border-gray-400">
				<h3>Cities</h3>
				<button className="btn" onClick={() => navigate("/admin/cities/add")}>
					Add City
				</button>
			</div>
			{citiesData.loading ? (
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
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{citiesData.cities.length >= 1 &&
								citiesData.cities.map((city, index) => (
									<tr key={city._id}>
										<td>{index + 1}</td>
										<td>{city.name}</td>
										<td>
											<Switch status={city.status} id={city._id} changeHandler={() => handleStatusChange(city)} />
										</td>
										<td>
											<div className="flex">
												<span className="mr-3 cursor-pointer text-2xl" onClick={() => navigate(`/admin/cities/edit/${city._id}`)}>
													<FaEdit className="fill-blue-500" />
												</span>
												<span className="cursor-pointer text-2xl" onClick={() => showModal({ ...alertData, id: city._id }, ConfirmationAlert)}>
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
		deleteCity: (cityId) => dispatch(deleteCity(cityId)),
		updateCityStatus: (id, details) => dispatch(updateCityStatus(id, details)),
	};
};

export default connect(null, mapDispatchToProps)(Cities);
