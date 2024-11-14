import React from "react";

import { NavLink } from "react-router-dom";
import Services from "../components/Home/Services";

function Home() {
	return (
		<div className="home">
			<h2>
				This is the main Home page <NavLink to="/booking/locations">book now</NavLink>
			</h2>
			<Services />
		</div>
	);
}

export default Home;
