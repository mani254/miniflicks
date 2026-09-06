import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header/Header";
import SmoothScroll from "../components/SmoothScroll/SmoothScroll";
import Footer from "../components/Footer/Footer";
import { whatsappColoured } from "../utils";
import { useUserBanners } from "../hooks/useCatalog";

function UsersLayout() {
	const location = useLocation();
	// Prefetch banners on user layout mount
	useUserBanners();

	useEffect(() => {
		const handleScrollToTop = () => {
			window.scrollTo(0, 0);
		};

		handleScrollToTop();
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

				<div className="whatsapp-icon">
					<a href="https://wa.me/+919019162002?text=Hello. " className="btn-whatsapp-pulse" target="_blank" rel="noopener noreferrer">
						<img src={whatsappColoured} alt="whatsapp icon" />
					</a>
				</div>
			</main>
		</SmoothScroll>
	);
}

export default UsersLayout;
