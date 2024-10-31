import React, { useState, useEffect } from "react";
import OtherDetailsNav from "./OtherDetailsNav";
import { Outlet } from "react-router-dom";

import OrderSummary from "./OrderSummary";
import SelectedDetails from "./SelectedDetails";

function OtherDetails() {
	return (
		<section className="flex flex-col md:flex-row w-full gap-4 lg:gap-10 py-6">
			<div className="w-full md:w-2/3">
				<OtherDetailsNav />
				<Outlet />
			</div>
			<div className="w-full md:w-1/3 ">
				<OrderSummary />
				<div className="mt-4">
					<SelectedDetails />
				</div>
			</div>
		</section>
	);
}

export default OtherDetails;
