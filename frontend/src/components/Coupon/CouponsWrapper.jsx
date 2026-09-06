import React from "react";
import { Outlet } from "react-router-dom";
import { useCoupons } from "../../hooks/useCatalog";

function CouponsWrapper() {
	const { data, isLoading, refetch } = useCoupons();
	const coupons = data?.coupons || [];

	return (
		<Outlet context={{ coupons, loading: isLoading, refetch }} />
	);
}

export default CouponsWrapper;
