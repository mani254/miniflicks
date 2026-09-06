import React from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { useCakes } from "../../hooks/useCatalog";

function CakesWrapper() {
	const [params, setParams] = useSearchParams();
	const queryParams = Object.fromEntries(params);
	const { data, isLoading, refetch } = useCakes(queryParams);

	const cakeData = {
		cakes: data?.cakes || [],
		loading: isLoading,
	};
	const noOfDocuments = data?.totalDocuments || 0;

	return (
		<Outlet context={{ cakeData, noOfDocuments, params, setParams, refetch }} />
	);
}

export default CakesWrapper;
