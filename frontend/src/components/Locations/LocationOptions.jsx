import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { getLocations } from "../../redux/location/locationActions";

function LocationOptions({ location, getLocations, value, changeHandler, params = false, setParams, all = false }) {
	const [locationValue, setLocationValue] = useState("");
	console.log(value, "value");

	useEffect(() => {
		const fetchLocations = async () => {
			try {
				await getLocations();
			} catch (err) {
				console.log(err);
			}
		};
		fetchLocations();
	}, []);

	useEffect(() => {
		if (params && params.get("location")) {
			setLocationValue(params.get("location"));
		} else {
			setLocationValue("");
		}
	}, [params]);

	useEffect(() => {
		if (location.locations.length === 0 || params) return;

		if (value) {
			return setLocationValue(value);
		}
		if (location.locations.length > 0 && all) {
			return changeHandler({ target: { name: "location", value: "" } });
		}

		if (location.locations.length > 0) {
			changeHandler({ target: { name: "location", value: location.locations[0]._id } });
		}
	}, [location.locations, value]);

	function handleLocationChange(event) {
		const { value } = event.target;
		setLocationValue(value);

		if (params) {
			const newParams = new URLSearchParams(params);
			value ? newParams.set("location", value) : newParams.delete("location");
			return setParams(newParams);
		}
		changeHandler(event);
	}

	return (
		<div className="input-wrapper">
			<label htmlFor="location">Location</label>
			{location.locations.length > 0 && (
				<select id="location" name="location" value={locationValue} onChange={handleLocationChange} required>
					{(params || all) && <option value="">All</option>}
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
