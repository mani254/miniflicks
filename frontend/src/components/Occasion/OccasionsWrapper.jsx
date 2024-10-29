import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { connect } from "react-redux";
import { getOccasions } from "../../redux/occasion/occasionActions";
import { useSearchParams } from "react-router-dom";

function OccasionsWrapper({ getOccasions, occasionData }) {
	const [noOfDocuments, setNoOfDocuments] = useState(0);
	const [params, setParams] = useSearchParams();

	useEffect(() => {
		(async () => {
			try {
				const data = await getOccasions(params);
				setNoOfDocuments(data.totalDocuments);
			} catch (err) {
				console.log(err);
			}
		})();
	}, [params]);

	return (
		<>
			<Outlet context={{ occasionData, noOfDocuments, params, setParams }} />
		</>
	);
}

const mapStateToProps = (state) => {
	return {
		occasionData: state.occasions,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getOccasions: (params) => dispatch(getOccasions(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OccasionsWrapper);
