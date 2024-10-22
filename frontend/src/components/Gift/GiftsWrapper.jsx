import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { connect } from "react-redux";
import { getGifts } from "../../redux/gift/giftActions";
import { useSearchParams } from "react-router-dom";

function GiftWrapper({ getGifts, giftsData }) {
	const [noOfDocuments, setNoOfDocuments] = useState(0);
	const [params, setParams] = useSearchParams();

	useEffect(() => {
		(async () => {
			try {
				const data = await getGifts(params);
				setNoOfDocuments(data.totalDocuments);
			} catch (err) {
				console.log(err);
			}
		})();
	}, [params]);

	return (
		<>
			<Outlet context={{ giftsData, noOfDocuments, params, setParams }} />
		</>
	);
}

const mapStateToProps = (state) => {
	return {
		giftsData: state.gifts,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getGifts: (params) => dispatch(getGifts(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(GiftWrapper);
