import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { connect } from "react-redux";
import { getGifts } from "../../redux/gift/giftActions";

function GiftWrapper({ getGifts, giftData }) {
	useEffect(() => {
		(async () => {
			try {
				await getGifts();
			} catch (err) {
				console.log(err);
			}
		})();
	}, [getGifts]);

	return (
		<>
			<Outlet context={giftData} />
		</>
	);
}

const mapStateToProps = (state) => {
	return {
		giftData: state.gifts,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getGifts: () => dispatch(getGifts()),
});

export default connect(mapStateToProps, mapDispatchToProps)(GiftWrapper);
