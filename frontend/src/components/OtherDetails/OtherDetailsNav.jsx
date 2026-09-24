import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBookingStore } from "../../store/bookingStore";
import OtherDetailsButton from "../Booking/OtherDetailsButton";

function OtherDetailsNav({ activeIndex, navOptions, setNavOptions, setActiveIndex }) {
	const navigate = useNavigate();
	const location = useLocation();
	const { package: currentPackage, cakes: currentCakes, setBookingCakes } = useBookingStore();

	// Ensure all tabs are always available so users can order cakes even if not included in package
	useEffect(() => {
		const initialOptions = ["Packages", "Occasions", "Cakes", "Addons", "Gifts"];
		setNavOptions(initialOptions);
	}, [setNavOptions]);

	// Sync cake free status when package changes
	useEffect(() => {
		if (!currentPackage || !currentCakes || currentCakes.length === 0) return;
		const pkgIncludesCake = Boolean(currentPackage.addons?.some((a) => typeof a === "string" && a.toLowerCase().includes("cake")));

		if (!pkgIncludesCake && currentCakes.some((c) => c.free)) {
			setBookingCakes(currentCakes.map((c) => ({ ...c, free: false })));
		} else if (pkgIncludesCake && !currentCakes.some((c) => c.free)) {
			const updated = [...currentCakes];
			updated[0] = { ...updated[0], free: true };
			setBookingCakes(updated);
		}
	}, [currentPackage, currentCakes, setBookingCakes]);

	// Set the active index based on the current URL path
	useEffect(() => {
		const pathSegments = location.pathname.split("/");
		const lastSegment = pathSegments[pathSegments.length - 1];

		const initialActiveIndex = navOptions.findIndex((option) => option.toLowerCase() === lastSegment);
		if (initialActiveIndex !== -1) {
			if (activeIndex !== initialActiveIndex) {
				setActiveIndex(initialActiveIndex);
			}
		}
	}, [location.pathname, navOptions, activeIndex, setActiveIndex]);

	function handleOptionClick(index) {
		setActiveIndex(index);
		navigate(`${navOptions[index].toLowerCase()}`);
	}

	return (
		<div className="flex items-center gap-2 flex-wrap justify-center md:justify-start md:gap-5">
			{navOptions.map((option, index) => (
				<div key={index} className={`px-4 py-[3px] border border-primary rounded-full cursor-pointer option transition-all ${index === activeIndex ? "active bg-primary text-white" : "hover:bg-primary hover:bg-opacity-15"}`} onClick={() => handleOptionClick(index)}>
					{option}
				</div>
			))}
			<div className="book-now-btn">
				<OtherDetailsButton navOptions={navOptions} setActiveIndex={setActiveIndex} activeIndex={activeIndex} />
			</div>
		</div>
	);
}

export default OtherDetailsNav;
