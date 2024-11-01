import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { connect } from "react-redux";
import { getCakes } from "../../redux/cake/cakeActions";
import { useSearchParams } from "react-router-dom";

function CakesWrapper({ getCakes, cakeData }) {
	const [noOfDocuments, setNoOfDocuments] = useState(0);
	const [params, setParams] = useSearchParams();

	useEffect(() => {
		(async () => {
			try {
				const data = await getCakes(params);
				setNoOfDocuments(data.totalDocuments);
			} catch (err) {
				console.log(err);
			}
		})();
	}, [params]);

	return (
		<>
			<Outlet context={{ cakeData, noOfDocuments, params, setParams }} />
		</>
	);
}

const mapStateToProps = (state) => {
	return {
		cakeData: state.cakes, // Update state to reference cakes
	};
};

const mapDispatchToProps = (dispatch) => ({
	getCakes: (params) => dispatch(getCakes(params)), // Update to use getCakes action
});

export default connect(mapStateToProps, mapDispatchToProps)(CakesWrapper);
