import React from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { useOccasions } from "../../hooks/useCatalog";

function OccasionsWrapper() {
	const [params, setParams] = useSearchParams();
	const queryParams = Object.fromEntries(params);
	const { data, isLoading, refetch } = useOccasions(queryParams);

	const occasionData = {
		occasions: data?.occasions || [],
		loading: isLoading,
	};
	const noOfDocuments = data?.totalDocuments || 0;

	return (
		<Outlet context={{ occasionData, noOfDocuments, params, setParams, refetch }} />
	);
}

export default OccasionsWrapper;
