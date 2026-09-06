import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCities } from "../../hooks/useCatalog";
import { toast } from "sonner";

function CitiesWrapper() {
	const navigate = useNavigate();
	const { admin } = useAuth();
	const { data, isLoading, refetch } = useCities();

	useEffect(() => {
		if (admin && admin.role !== "superAdmin" && !admin.superAdmin) {
			navigate("/admin", { replace: true });
			toast.error("Super Admin privileges required to manage cities");
		}
	}, [admin, navigate]);

	const cities = data?.cities || [];

	return (
		<Outlet context={{ cities, loading: isLoading, refetch }} />
	);
}

export default CitiesWrapper;
