import React from "react";
// import SearchComponent from "../SearchComponent/SearchComponent";
import { connect } from "react-redux";
import { logout } from "../../redux/auth/authActions";
import { useNavigate } from "react-router-dom";

function BackendHeader({ auth, logout }) {
	const navigate = useNavigate();
	async function logoutFunction() {
		try {
			await logout();
			navigate("/login");
		} catch (err) {
			console.error("Logout failed:", err);
		}
	}

	return (
		<header className="bg-white">
			<div className="flex items-center justify-between py-2 container">
				{/* <img className="h-8" src="https://www.logodesign.net/logo-new/text-in-paint-splatter-9358ld.png?nwm=1&nws=1&industry=text&txt_keyword=All" alt="e-commerce logo" /> */}
				<h2 className="font-jokerman text-logo text-lg">Miniflicks</h2>
				{/* <SearchComponent /> */}
				<div className="flex gap-3">
					<div className="flex items-center space-x-3">
						<p>{auth.admin?.name}</p>
						<img className="h-8" src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="user image" />
					</div>
					<button className="Btn" onClick={logoutFunction}>
						<div className="sign">
							<svg viewBox="0 0 512 512">
								<path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
							</svg>
						</div>

						<div className="text">Logout</div>
					</button>
				</div>
			</div>
		</header>
	);
}

const mapStateToProps = (state) => {
	return {
		auth: state.auth,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		logout: () => dispatch(logout()),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(BackendHeader);
