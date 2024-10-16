import React, { useEffect, useState } from "react";

import { connect } from "react-redux";
import { getCities } from "../../redux/citiy/cityActions";

function CityOptions({ city, getCities, value, changeHandler, params = false, setParams }) {
	const [cityValue, setCityValue] = useState("");

	useEffect(() => {
		const fetchCities = async () => {
			try {
				await getCities();
			} catch (err) {
				console.error(err);
			}
		};
		fetchCities();
	}, []);

	useEffect(() => {
		if (params && params.get("city")) {
			setCityValue(params.get("city"));
		} else {
			setCityValue("");
		}
	}, []);

	useEffect(() => {
		if (city.cities.length === 0 || params) return;

		if (value) {
			return setCityValue(value);
		}
		if (city.cities.length > 0) {
			changeHandler({ target: { name: "cityId", value: city.cities[0]._id } });
		}
	}, [city.cities, value]);

	function handleCityChange(event) {
		const { value } = event.target;
		setCityValue(value);

		if (params) {
			const newParams = new URLSearchParams(params);
			value ? newParams.set("city", value) : newParams.delete("city");
			setParams(newParams);
		} else {
			changeHandler(event);
		}
	}

	return (
		<div className="input-wrapper">
			<label htmlFor="cityId">City</label>
			{city.cities.length > 0 && (
				<select id="cityId" name="cityId" value={cityValue} onChange={handleCityChange} required>
					{params && <option value="">All</option>}
					{city.cities.map((city) => (
						<option key={city._id} value={city._id}>
							{city.name}
						</option>
					))}
				</select>
			)}
		</div>
	);
}

const mapDispatchToProps = (dispatch) => ({
	getCities: () => dispatch(getCities()),
});
const mapStateToProps = (state) => ({
	city: state.cities,
});

export default connect(mapStateToProps, mapDispatchToProps)(CityOptions);
