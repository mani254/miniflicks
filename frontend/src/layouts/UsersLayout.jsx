import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import { useDispatch } from "react-redux";
import { connect } from "react-redux";
import { getLocations } from "../redux/location/locationActions";
import SmoothScroll from "../components/SmoothScroll/SmoothScroll";

import Footer from "../components/Footer/Footer";

import { getBanners } from "../redux/banner/bannerActions";

function UsersLayout({ customerBooking, getBanners }) {
	const dispatch = useDispatch();

	useEffect(() => {
		async function fetchBanners() {
			try {
				await getBanners();
			} catch (err) {
				console.log(err);
			}
		}
		fetchBanners();
	}, []);

	useEffect(() => {
		if (!customerBooking.city) return;

		async function fetchLocations() {
			try {
				await dispatch(getLocations(customerBooking.city));
			} catch (err) {
				console.log(err);
			}
		}
		fetchLocations();
	}, [customerBooking.city]);

	return (
		<SmoothScroll>
			<main>
				<Header />

				<Outlet />

				<Footer />
			</main>
		</SmoothScroll>
	);
}

const mapStateToProps = (state) => {
	return {
		customerBooking: state.customerBooking,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		getBanners: () => dispatch(getBanners()),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersLayout);
