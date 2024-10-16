import React from "react";
import { Outlet } from "react-router-dom";

function CustomersWrapper() {
	return (
		<>
			<Outlet />
		</>
	);
}

export default CustomersWrapper;
