import React, { lazy, Suspense, useEffect } from "react";
import { connect } from "react-redux";
import { Route, Routes } from "react-router-dom";

import "./App.css";
import { HelmetProvider } from "react-helmet-async";

import Login from "./pages/Login";
import UsersLayout from "./layouts/UsersLayout";
import Home from "./pages/Home";
import SlotBookingPage from "./pages/SlotBookingPage";
import UserLocations from "./components/Locations/UserLocations";
import UserScreens from "./components/Screen/UserScreens";
import { showModal } from "./redux/modal/modalActions";
// import EntryPop from "./components/KnowMore/EntryPop";
// import BookingLayout from "./layouts/BookingLayout";
const BookingLayout = lazy(() => import("./layouts/BookingLayout"));
import OtherDetails from "./components/OtherDetails/OtherDetails";
import PackagesSection from "./components/OtherDetails/PackagesSection";
import OccasionsSection from "./components/OtherDetails/OccasionsSection";
import UserItems from "./components/Addon/UserAddons";
import CustomerDetails from "./components/OtherDetails/CustomerDetails";
import TestimonialsPage from "./pages/TestimonialsPage";
import PaymentPage from "./pages/PaymentPage";
import TermsAndConditionsPage from "./pages/TermsAndConditionsPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import ContactPage from "./pages/ContactPage";
import GalleryPage from "./pages/GalleryPage";
import AboutPage from "./pages/AboutPage";

import axios from "axios";
import Loader from "./components/Loader/Loader";

const BackendLayout = lazy(() => import("./layouts/BackendLayout"));
import UpdateBooking from "./components/Booking/UpdateBooking";
import Dashboard from "./components/Dashboard/Dashboard";
import Notification from "./components/Notifications/Notifications";
import Modal from "./components/Modal/Modal";

import CitiesWrapper from "./components/Cities/CitiesWrapper";
import Cities from "./components/Cities/Cities";
import AddCities from "./components/Cities/AddCities";

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

import OccasionsWrapper from "./components/Occasion/OccasionsWrapper";
import Occasions from "./components/Occasion/Occasions";
import AddOccasions from "./components/Occasion/AddOccasions";

import Cakes from "./components/Cake/Cakes";
import CakesWrapper from "./components/Cake/CakesWrapper";
import AddCakes from "./components/Cake/AddCakes";
import DetailedView from "./components/Booking/DetailedView";
import BookingConfirmation from "./components/Booking/BookingConfirmation";
import Paymentgateway from "./pages/Paymentgateway";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

function App({ modal, showModal }) {
	axios.defaults.withCredentials = true;

	// useEffect(() => {
	// 	const timer = setTimeout(() => {
	// 		showModal({}, EntryPop);
	// 	}, 3000);

	// 	// Cleanup function to clear the timeout if the component unmounts
	// 	return () => clearTimeout(timer);
	// }, []);

	return (
		<React.Fragment>
			<div className="bg-zinc-100 min-h-screen">
				<Notification />
				<HelmetProvider>
					<Routes>
						<Route path="/" element={<UsersLayout />}>
							<Route index element={<Home />} />
							<Route path="termsandconditions" element={<TermsAndConditionsPage />} />
							<Route path="refundPolicy" element={<RefundPolicyPage />} />
							<Route path="testimonials" element={<TestimonialsPage />} />
							<Route path="contact" element={<ContactPage />} />
							<Route path="gallery" element={<GalleryPage />} />
							<Route path="bookingConfirmation" element={<BookingConfirmation />} />
							<Route path="paymentgateway" element={<Paymentgateway />} />
							<Route path="about" element={<AboutPage />} />
							<Route
								path="booking"
								element={
									<Suspense
										fallback={
											<div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
												<Loader />
											</div>
										}>
										<BookingLayout />
									</Suspense>
								}>
								<Route path="edit/:id" element={<UpdateBooking edit={true} />}></Route>
								<Route path="locations" element={<UserLocations />}></Route>
								<Route path="screens" element={<UserScreens />}></Route>
								<Route path="slots" element={<SlotBookingPage />}></Route>
								<Route path="customerDetails" element={<CustomerDetails />} />
								<Route path="otherdetails" element={<OtherDetails />}>
									<Route path="packages" element={<PackagesSection />} />
									<Route path="occasions" element={<OccasionsSection />} />
									<Route path="addons" element={<UserItems type="addons" />} />
									<Route path="gifts" element={<UserItems type="gifts" />} />
									<Route path="cakes" element={<UserItems type="cakes" />} />
								</Route>

								<Route path="payment" element={<PaymentPage />}></Route>
							</Route>
						</Route>
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Login />} />

						<Route
							path="/admin"
							element={
								<Suspense
									fallback={
										<div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
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
							<Route path="occasions" element={<OccasionsWrapper />}>
								<Route index element={<Occasions />} />
								<Route path="add" element={<AddOccasions />} />
								<Route path="edit/:id" element={<AddOccasions update={true} />} />
							</Route>
							<Route path="cakes" element={<CakesWrapper />}>
								<Route index element={<Cakes />} />
								<Route path="add" element={<AddCakes />} />
								<Route path="edit/:id" element={<AddCakes update={true} />} />
							</Route>
							<Route path="bookings" element={<BookingsWrapper />}>
								<Route index element={<Bookings />} />
								<Route path="view/:id" element={<DetailedView />} />
							</Route>
							<Route path="customers" element={<CustomersWrapper />}>
								<Route index element={<Customers />} />
							</Route>
						</Route>
					</Routes>
				</HelmetProvider>
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

const mapDispatchToProps = (dispatch) => {
	return {
		showModal: (props, component) => dispatch(showModal(props, component)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
