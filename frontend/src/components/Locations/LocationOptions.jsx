import React, { useEffect } from "react";
import { connect } from "react-redux";
import { getLocations } from "../../redux/location/locationActions";

function LocationOptions({ value, changeHandler, location, getLocations }) {
	useEffect(() => {
		(async () => {
			try {
				await getLocations();
			} catch (err) {
				console.log(err);
			}
		})();
	}, []);

	useEffect(() => {
		if (value || location.locations.length === 0) return;
		if (location.locations.length > 0) {
			changeHandler({ target: { name: "location", value: location.locations[0]._id } });
		}
	}, [location.locations, value]);

	return (
		<div className="input-wrapper">
			<label htmlFor="location">Location</label>
			{location.locations.length > 0 && (
				<select id="location" name="location" value={value} onChange={changeHandler} required>
					{location.locations.map((loc) => (
						<option key={loc._id} value={loc._id}>
							{loc.name}
						</option>
					))}
				</select>
			)}
		</div>
	);
}

const mapDispatchToProps = (dispatch) => ({
	getLocations: () => dispatch(getLocations()),
});

const mapStateToProps = (state) => ({
	location: state.locations,
});

export default connect(mapStateToProps, mapDispatchToProps)(LocationOptions);
