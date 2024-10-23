import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { connect } from "react-redux";
import { getAddons } from "../../redux/addon/addonActions";
import { useSearchParams } from "react-router-dom";

function AddonWrapper({ getAddons, addonData }) {
	const [noOfDocuments, setNoOfDocuments] = useState(0);
	const [params, setParams] = useSearchParams();

	useEffect(() => {
		(async () => {
			try {
				const data = await getAddons(params);
				setNoOfDocuments(data.totalDocuments);
			} catch (err) {
				console.log(err);
			}
		})();
	}, [params]);

	return (
		<>
			<Outlet context={{ addonData, noOfDocuments, params, setParams }} />
		</>
	);
}

const mapStateToProps = (state) => {
	return {
		addonData: state.addons,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getAddons: (params) => dispatch(getAddons(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddonWrapper);
