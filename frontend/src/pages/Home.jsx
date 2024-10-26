import React from "react";

import { NavLink } from "react-router-dom";

function Home() {
	return (
		<h2>
			This is the main Home page <NavLink to="/booking/locations">book now</NavLink>
		</h2>
	);
}

export default Home;
