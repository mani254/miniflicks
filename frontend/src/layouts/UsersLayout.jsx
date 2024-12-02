import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import { useDispatch } from "react-redux";
import { connect } from "react-redux";
import { getLocations } from "../redux/location/locationActions";
import SmoothScroll from "../components/SmoothScroll/SmoothScroll";
import { useLocation } from "react-router-dom";
import Footer from "../components/Footer/Footer";

import {whatsappColoured} from '../utils';
import { getBanners } from "../redux/banner/bannerActions";

function UsersLayout({ customerBooking, getBanners }) {
	const dispatch = useDispatch();
	const location = useLocation();

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

	useEffect(() => {
		const handleScrollToTop = () => {
			window.scrollTo(0, 0); // Reset scroll position to top
		};

		handleScrollToTop(); // Reset scroll position on component mount

		// Add scroll listener for future route changes
		window.addEventListener("popstate", handleScrollToTop);

		return () => {
			window.removeEventListener("popstate", handleScrollToTop);
		};
	}, [location.pathname]);

	return (
		<SmoothScroll>
			<main>
				<Header />

				<Outlet />

				<Footer />

				<div class="whatsapp-icon">
					<a href="https://wa.me/+919019162002?text=Hello. " class="btn-whatsapp-pulse" target="_blank">
						<img src={whatsappColoured} alt="whatsapp icon"/>
					</a>
				</div>
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
