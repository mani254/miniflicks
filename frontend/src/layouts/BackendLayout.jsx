import React, { useEffect } from "react";
import BackendNav from "../components/BackendNav/BackendNav";
import BackendHeader from "../components/BackendHeader/BackendHeader";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/Loader/Loader";

function BackendLayout() {
	const navigate = useNavigate();
	const { isLoggedIn, isInitialLoading } = useAuth();

	useEffect(() => {
		const token = localStorage.getItem("authToken");
		if (!token) {
			navigate("/login");
		}
	}, [navigate]);

	if (isInitialLoading) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
				<Loader />
			</div>
		);
	}

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
