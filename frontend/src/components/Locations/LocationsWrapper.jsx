import React from "react";
import { Outlet } from "react-router-dom";
import { useLocations } from "../../hooks/useCatalog";

function LocationsWrapper() {
	const { data: locations = [], isLoading, refetch } = useLocations();

	return (
		<Outlet context={{ locations, loading: isLoading, refetch }} />
	);
}

export default LocationsWrapper;
