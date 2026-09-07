import React from "react";
import { Outlet } from "react-router-dom";
import { useScreens } from "../../hooks/useCatalog";

function ScreensWrapper() {
	const { data: screens = [], isLoading, refetch } = useScreens();

	return (
		<Outlet context={{ screens, loading: isLoading, refetch }} />
	);
}

export default ScreensWrapper;
