import React, { useEffect } from "react";

import { connect } from "react-redux";
import { getCities } from "../../redux/citiy/cityActions";

function CityOptions({ value, changeHandler, city, getCities }) {
	useEffect(() => {
		(async () => {
			try {
				await getCities();
			} catch (err) {
				console.log(err);
			}
		})();
	}, []);

	useEffect(() => {
		if (value || city.cities.length === 0) return;
		if (city.cities.length > 0) {
			changeHandler({ target: { name: "cityId", value: city.cities[0]._id } });
		}
	}, [city.cities, value]);
	return (
		<div className="input-wrapper">
			<label htmlFor="cityId">City</label>
			{city.cities.length > 0 && (
				<select id="cityId" name="cityId" value={value} onChange={changeHandler} required>
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
