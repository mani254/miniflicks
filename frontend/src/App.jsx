import React, { lazy, Suspense } from "react";
import { connect } from "react-redux";
import { Route, Routes } from "react-router-dom";

import "./App.css";

import Login from "./pages/Login";
import UsersLayout from "./layouts/UsersLayout";
import Home from "./pages/Home";
import SlotBookingPage from "./pages/SlotBookingPage";

const BackendLayout = lazy(() => import("./layouts/BackendLayout"));
import Dashboard from "./components/Dashboard/Dashboard";
import Notification from "./components/Notifications/Notifications";
import Modal from "./components/Modal/Modal";

import CitiesWrapper from "./components/Cities/CitiesWrapper";
import Cities from "./components/Cities/Cities";
import AddCities from "./components/Cities/addCities";

import LocationsWrapper from "./components/Locations/LocationsWrapper";
import Locations from "./components/Locations/Locations";
import AddLocations from "./components/Locations/AddLocations";

import CouponsWrapper from "./components/Coupon/CouponsWrapper";
import AddCoupons from "./components/Coupon/AddCoupons";
import Coupons from "./components/Coupon/Coupons";

import BannersWrapper from "./components/Banner/BannersWrapper";
import Banners from "./components/Banner/Banners";
import AddBanner from "./components/Banner/AddBanner";

import GiftsWrapper from "./components/Gift/GiftsWrapper";
import Gifts from "./components/Gift/Gifts";
import AddGift from "./components/Gift/AddGift";

import AddAddons from "./components/Addon/AddAddons";
import Addons from "./components/Addon/Addons";
import AddonsWrapper from "./components/Addon/AddonsWrapper";

import ScreensWrapper from "./components/Screen/ScreensWrapper";
import AddScreen from "./components/Screen/AddScreen";
import Screens from "./components/Screen/Screens";

import BookingsWrapper from "./components/Booking/BookingsWrapper";
import Bookings from "./components/Booking/Bookings";
import CustomersWrapper from "./components/Customers/CustomersWrapper";
import Customers from "./components/Customers/Customers";

import axios from "axios";
import Loader from "./components/Loader/Loader";

function App({ modal }) {
	axios.defaults.withCredentials = true;
	return (
		<React.Fragment>
			<div className="bg-zinc-100 min-h-screen">
				<Notification />
				<Routes>
					<Route path="/" element={<UsersLayout />}>
						<Route index element={<Home />} />
						<Route path="slot" element={<SlotBookingPage />}></Route>
					</Route>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Login />} />

					<Route
						path="/admin"
						element={
							<Suspense
								fallback={
									<div className="w-full h-screen">
										<Loader />
									</div>
								}>
								<BackendLayout />
							</Suspense>
						}>
						<Route path="dashboard" element={<Dashboard />} />
						<Route path="cities" element={<CitiesWrapper />}>
							<Route index element={<Cities />} />
							<Route path="add" element={<AddCities />} />
							<Route path="edit/:id" element={<AddCities update={true} />} />
						</Route>
						<Route path="screens" element={<ScreensWrapper />}>
							<Route index element={<Screens />} />
							<Route path="add" element={<AddScreen />} />
							<Route path="edit/:id" element={<AddScreen update={true} />} />
						</Route>
						<Route path="locations" element={<LocationsWrapper />}>
							<Route index element={<Locations />} />
							<Route path="add" element={<AddLocations />} />
							<Route path="edit/:id" element={<AddLocations update={true} />} />
						</Route>
						<Route path="coupons" element={<CouponsWrapper />}>
							<Route index element={<Coupons />} />
							<Route path="add" element={<AddCoupons />} />
							<Route path="edit/:id" element={<AddCoupons update={true} />} />
						</Route>
						<Route path="banners" element={<BannersWrapper />}>
							<Route index element={<Banners />} />
							<Route path="add" element={<AddBanner />} />
							<Route path="edit/:id" element={<AddBanner update={true} />} />
						</Route>
						<Route path="gifts" element={<GiftsWrapper />}>
							<Route index element={<Gifts />} />
							<Route path="add" element={<AddGift />} />
							<Route path="edit/:id" element={<AddGift update={true} />} />
						</Route>
						<Route path="addons" element={<AddonsWrapper />}>
							<Route index element={<Addons />} />
							<Route path="add" element={<AddAddons />} />
							<Route path="edit/:id" element={<AddAddons update={true} />} />
						</Route>
						<Route path="bookings" element={<BookingsWrapper />}>
							<Route index element={<Bookings />} />
						</Route>
						<Route path="customers" element={<CustomersWrapper />}>
							<Route index element={<Customers />} />
						</Route>
					</Route>
				</Routes>
			</div>

			{modal.showModal && <Modal props={modal.modalProps} component={modal.modalComponent} />}
		</React.Fragment>
	);
}

const mapStateToProps = (state) => {
	return {
		modal: state.modal,
	};
};

export default connect(mapStateToProps, null)(App);
