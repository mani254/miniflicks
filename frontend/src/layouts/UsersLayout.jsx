import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";

function UsersLayout() {
	return (
		<main>
			<Header />
			<div className="container m-auto max-w-[1350px]">
				<Outlet />
			</div>
		</main>
	);
}

export default UsersLayout;
