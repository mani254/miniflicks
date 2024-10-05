import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";

import { connect } from "react-redux";
import { addCity, updateCity } from "../../redux/citiy/cityActions";

function AddCities({ addCity, update = false, updateCity }) {
	const navigate = useNavigate();
	const { id } = useParams();
	const citiesData = useOutletContext();

	const [details, setDetails] = useState({
		name: "",
		status: true,
	});
	useEffect(() => {
		if (update) {
			const currentCity = citiesData.cities.find((city) => city._id == id);
			if (!currentCity) return;
			setDetails(currentCity);
		}
	}, [citiesData.cities]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setDetails((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (update) {
			try {
				await updateCity(id, details);
				navigate("/admin/cities");
			} catch (error) {
				console.error(error);
			}
		} else {
			try {
				await addCity(details);
				navigate("/admin/cities");
			} catch (error) {
				console.error(error);
			}
		}
	};

	return (
		<div className="w-full container px-6 mt-3">
			<div className="pb-2 border-b border-gray-400">
				<h3>{update ? "Update City" : "Add City"}</h3>
			</div>

			<form className="max-w-xl m-auto" onSubmit={handleSubmit}>
				<div className="outer-box">
					<div className="input-wrapper">
						<label htmlFor="name">Name</label>
						<input type="text" id="name" name="name" placeholder="City Name" value={details.name} onChange={handleChange} required />
					</div>
					<div className="input-wrapper">
						<label htmlFor="status">Status</label>
						<select id="status" name="status" value={details.status} onChange={handleChange} required>
							<option value="true">Active</option>
							<option value="false">In Active</option>
						</select>
					</div>
					<button className="btn btn-1" type="submit">
						{update ? "Update City" : "Add City"}
					</button>
				</div>
			</form>
		</div>
	);
}

const mapDispatchToProps = (dispatch) => {
	return {
		addCity: (details) => dispatch(addCity(details)),
		updateCity: (cityId, cityData) => dispatch(updateCity(cityId, cityData)),
	};
};

export default connect(null, mapDispatchToProps)(AddCities);
