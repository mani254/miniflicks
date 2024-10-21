import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { connect } from "react-redux";
import { getCities } from "../../redux/citiy/cityActions";
import { showNotification } from "../../redux/notification/notificationActions";
import { useNavigate } from "react-router-dom";

function CitiesWrapper({ getCities, citiesData, auth, showNotification }) {
	const navigate = useNavigate();
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
		if (!auth.admin?.superAdmin) {
			navigate("/login", { replace: true });
			showNotification("Login in as super Admin to access cities");
		}
	}, [auth.admin]);

	return (
		<>
			<Outlet context={citiesData} />
		</>
	);
}

const mapStateToProps = (state) => {
	return {
		citiesData: state.cities,
		auth: state.auth,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getCities: () => dispatch(getCities()),
	showNotification: (message) => dispatch(showNotification(message)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CitiesWrapper);
