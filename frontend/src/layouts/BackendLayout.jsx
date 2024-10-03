import React from "react";

import BackendNav from "../components/BackendNav/BackendNav";
import BackendHeader from "../components/BackendHeader/BackendHeader";

import { Outlet } from "react-router-dom";

function BackendLayout() {
	return (
		<React.Fragment>
			<div className="fixed w-full top-0 right-0 z-10">
				<BackendHeader />
			</div>
			<div className="flex relative">
				<div className=" w-1/5 max-w-64 sticky top-0 left-0 h-screen border-r border-black border-opacity-15 pt-14 py-2">
					<BackendNav />
				</div>
				<div className="w-full overflow-y-auto pt-14">
					<Outlet />
				</div>
			</div>
		</React.Fragment>
	);
}

export default BackendLayout;
