import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { connect } from "react-redux";
import { getScreens } from "../../redux/screen/screenActions";

function ScreensWrapper({ getScreens, screensData }) {
	useEffect(() => {
		(async () => {
			try {
				await getScreens();
			} catch (err) {
				console.log(err);
			}
		})();
	}, []);

	return (
		<>
			<Outlet context={screensData} />
		</>
	);
}

const mapStateToProps = (state) => {
	return {
		screensData: state.screens,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getScreens: () => dispatch(getScreens()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ScreensWrapper);
