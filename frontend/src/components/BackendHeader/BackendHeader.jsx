import React from "react";
// import SearchComponent from "../SearchComponent/SearchComponent";
import { connect } from "react-redux";
function BackendHeader({ auth }) {
	return (
		<header className="bg-white">
			<div className="flex items-center justify-between py-2 container">
				{/* <img className="h-8" src="https://www.logodesign.net/logo-new/text-in-paint-splatter-9358ld.png?nwm=1&nws=1&industry=text&txt_keyword=All" alt="e-commerce logo" /> */}
				<h2 className="font-jokerman text-logo text-lg">Miniflicks</h2>
				{/* <SearchComponent /> */}
				<div className="flex items-center space-x-3">
					<p>{auth.admin?.name}</p>
					<img className="h-8" src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="user image" />
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
export default connect(mapStateToProps, null)(BackendHeader);
