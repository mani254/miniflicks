import React, { useState } from "react";
import { connect } from "react-redux";
import { addCity } from "../../redux/citiy/cityActions";

function AddCities({ addCity }) {
	const [details, setDetails] = useState({
		name: "",
		status: true,
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setDetails((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await addCity(details);
			setDetails({ name: "", status: "" });
		} catch (error) {
			console.error("Failed to add city:", error);
		}
	};

	return (
		<div className="w-full container px-6 mt-3">
			<div className="pb-2 border-b border-gray-400">
				<h3>Add City</h3>
			</div>

			<form className="max-w-xl m-auto" onSubmit={handleSubmit}>
				<div className="outer-box">
					<div className="input-wrapper">
						<label htmlFor="name">Name</label>
						<input type="text" id="name" name="name" placeholder="City Name" value={details.name} onChange={handleChange} />
					</div>
					<div className="input-wrapper">
						<label htmlFor="status">Status</label>
						<select id="status" name="status" value={details.status} onChange={handleChange}>
							<option value="true">Active</option>
							<option value="false">In Active</option>
						</select>
					</div>
					<button className="btn btn-1" type="submit">
						Add City
					</button>
				</div>
			</form>
		</div>
	);
}

const mapDispatchToProps = (dispatch) => {
	return {
		addCity: (details) => dispatch(addCity(details)),
	};
};

export default connect(null, mapDispatchToProps)(AddCities);
