import React, { useState, useEffect } from "react";
import OtherDetailsNav from "./OtherDetailsNav";
import { Outlet } from "react-router-dom";

import OrderSummary from "./OrderSummary";
import SelectedDetails from "./SelectedDetails";

function OtherDetails() {
	return (
		<section className="flex flex-col lg:flex-row w-full gap-4 lg:gap-6 xl:gap-10 py-6 items-start">
			<div className="w-full lg:w-2/3">
				<OtherDetailsNav />
				<Outlet />
				<div className="block lg:hidden py-5">
					<OtherDetailsNav />
				</div>
			</div>
			<div className="w-full lg:w-1/3  sticky top-[70px] ">
				<OrderSummary />
				<div className="mt-4">
					<SelectedDetails />
				</div>
			</div>
		</section>
	);
}

export default OtherDetails;
