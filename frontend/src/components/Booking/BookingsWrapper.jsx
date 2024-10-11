import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

function BookingWrapper() {
	return (
		<>
			<Outlet />
		</>
	);
}

export default BookingWrapper;
