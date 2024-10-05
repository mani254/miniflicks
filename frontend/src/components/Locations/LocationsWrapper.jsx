import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { connect } from "react-redux";
import { getLocations } from "../../redux/location/locationActions";

function LocationsWrapper({ getLocations, locationsData }) {
	useEffect(() => {
		(async () => {
			try {
				console.log("hello");
				await getLocations();
			} catch (err) {
				console.log(err);
			}
		})();
	}, []);

	return (
		<>
			<Outlet context={locationsData} />
		</>
	);
}

const mapStateToProps = (state) => {
	return {
		locationsData: state.locations,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getLocations: () => dispatch(getLocations()),
});

export default connect(mapStateToProps, mapDispatchToProps)(LocationsWrapper);
