import React, { useEffect } from "react";

import BackendNav from "../components/BackendNav/BackendNav";
import BackendHeader from "../components/BackendHeader/BackendHeader";

import { Outlet, useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { initialLogin } from "../redux/auth/authActions";

function BackendLayout({ initialLogin, auth }) {
	const navigate = useNavigate();

	useEffect(() => {
		if (auth.isLoggedIn) return;

		const fetchInitialData = async () => {
			try {
				const token = localStorage.getItem("authToken");
				if (token) {
					await initialLogin(token);
					console.log("code after await initialLogin in try block");
				} else {
					navigate("/login");
				}
			} catch (err) {
				navigate("/login");
				console.log(err);
			}
		};
		fetchInitialData();
	}, []);

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

const mapStateToProps = (state) => {
	return {
		auth: state.auth,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		initialLogin: (token) => dispatch(initialLogin(token)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(BackendLayout);
