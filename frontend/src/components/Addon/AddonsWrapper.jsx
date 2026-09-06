import React from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { useAddons } from "../../hooks/useCatalog";

function AddonWrapper() {
	const [params, setParams] = useSearchParams();
	const queryParams = Object.fromEntries(params);
	const { data, isLoading, refetch } = useAddons(queryParams);

	const addonData = {
		addons: data?.addons || [],
		loading: isLoading,
	};
	const noOfDocuments = data?.totalDocuments || 0;

	return (
		<Outlet context={{ addonData, noOfDocuments, params, setParams, refetch }} />
	);
}

export default AddonWrapper;
