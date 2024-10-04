import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { connect } from "react-redux";
import { getCities } from "../../redux/citiy/cityActions";

function CitiesWrapper({ getCities, citiesData }) {
	useEffect(() => {
		(async () => {
			try {
				await getCities();
			} catch (err) {
				console.log(err);
			}
		})();
	}, []);
	return (
		<>
			<Outlet context={citiesData} />
		</>
	);
}

const mapStateToProps = (state) => {
	return {
		citiesData: state.cities,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getCities: () => dispatch(getCities()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CitiesWrapper);
