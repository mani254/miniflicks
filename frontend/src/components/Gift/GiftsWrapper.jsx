import React from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { useGifts } from "../../hooks/useCatalog";

function GiftWrapper() {
	const [params, setParams] = useSearchParams();
	const queryParams = Object.fromEntries(params);
	const { data, isLoading, refetch } = useGifts(queryParams);

	const giftsData = {
		gifts: data?.gifts || [],
		loading: isLoading,
	};
	const noOfDocuments = data?.totalDocuments || 0;

	return (
		<Outlet context={{ giftsData, noOfDocuments, params, setParams, refetch }} />
	);
}

export default GiftWrapper;
