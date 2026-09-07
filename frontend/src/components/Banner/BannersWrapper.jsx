import React from "react";
import { Outlet } from "react-router-dom";
import { useBanners } from "../../hooks/useCatalog";

function BannerWrapper() {
	const { data, isLoading, refetch } = useBanners();
	const banners = data?.banners || [];

	return (
		<Outlet context={{ banners, loading: isLoading, refetch }} />
	);
}

export default BannerWrapper;
