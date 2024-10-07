import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { connect } from "react-redux";
import { getBanners } from "../../redux/banner/bannerActions";

function BannerWrapper({ getBanners, bannerData }) {
	useEffect(() => {
		(async () => {
			try {
				await getBanners();
			} catch (err) {
				console.log(err);
			}
		})();
	}, [getBanners]);

	return (
		<>
			<Outlet context={bannerData} />
		</>
	);
}

const mapStateToProps = (state) => {
	return {
		bannerData: state.banners,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getBanners: () => dispatch(getBanners()),
});

export default connect(mapStateToProps, mapDispatchToProps)(BannerWrapper);
