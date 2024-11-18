import React, { useState, useEffect } from "react";
import OtherDetailsNav from "./OtherDetailsNav";
import { Outlet } from "react-router-dom";

import OrderSummary from "./OrderSummary";
import SelectedDetails from "./SelectedDetails";
import OtherDetailsButton from "../Booking/OtherDetailsButton";

function OtherDetails() {
	const [navOptions, setNavOptions] = useState(["Packages", "Occasions", "Addons", "Cakes", "Gifts"]);
	const [activeIndex, setActiveIndex] = useState(0);

	return (
		<section className="flex flex-col lg:flex-row w-full gap-4 lg:gap-6 xl:gap-10 py-6 items-start">
			<div className="w-full lg:w-2/3">
				<OtherDetailsNav navOptions={navOptions} setNavOptions={setNavOptions} setActiveIndex={setActiveIndex} activeIndex={activeIndex} />
				<Outlet context={{ navOptions, setNavOptions, activeIndex, setActiveIndex }} />
				{/* <div className="block  py-5">
					<OtherDetailsNav navOptions={navOptions} setNavOptions={setNavOptions} setActiveIndex={setActiveIndex} activeIndex={activeIndex} />
				</div> */}
				<div className="flex items-center justify-center mt-3">
					<div className="max-w-[300px]">
						<OtherDetailsButton navOptions={navOptions} setActiveIndex={setActiveIndex} activeIndex={activeIndex} />
					</div>
				</div>
			</div>
			<div className="w-full lg:w-1/3  sticky top-[70px] ">
				<OrderSummary navOptions={navOptions} activeIndex={activeIndex} setNavOptions={setNavOptions} setActiveIndex={setActiveIndex} />
				<div className="mt-4">
					<SelectedDetails />
				</div>
			</div>
		</section>
	);
}

export default OtherDetails;
