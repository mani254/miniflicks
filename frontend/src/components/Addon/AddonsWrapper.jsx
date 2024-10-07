import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { connect } from "react-redux";
import { getAddons } from "../../redux/addon/addonActions";

function AddonWrapper({ getAddons, addonData }) {
	useEffect(() => {
		(async () => {
			try {
				await getAddons();
			} catch (err) {
				console.log(err);
			}
		})();
	}, []);

	return (
		<>
			<Outlet context={addonData} />
		</>
	);
}

const mapStateToProps = (state) => {
	return {
		addonData: state.addons,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getAddons: () => dispatch(getAddons()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddonWrapper);
