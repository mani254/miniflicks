import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { connect } from "react-redux";
import { getCoupons } from "../../redux/coupon/couponActions";

function CouponsWrapper({ getCoupons, couponsData }) {
	useEffect(() => {
		(async () => {
			try {
				await getCoupons();
			} catch (err) {
				console.log(err);
			}
		})();
	}, []);

	return (
		<>
			<Outlet context={couponsData} />
		</>
	);
}

const mapStateToProps = (state) => {
	return {
		couponsData: state.coupons,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getCoupons: () => dispatch(getCoupons()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CouponsWrapper);
