import React, { useState, useCallback, useEffect } from "react";
import LocationOptions from "../Locations/LocationOptions";
import { useAuth } from "../../hooks/useAuth";

function toLocalDateStr(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function getDatePresetRange(presetKey) {
	const now = new Date();

	switch (presetKey) {
		case "thisMonth": {
			const from = new Date(now.getFullYear(), now.getMonth(), 1);
			const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
			return { fromDate: toLocalDateStr(from), toDate: toLocalDateStr(to) };
		}
		case "thisWeek": {
			const day = now.getDay();
			const diffToMon = day === 0 ? -6 : 1 - day;
			const monday = new Date(now);
			monday.setDate(now.getDate() + diffToMon);
			const sunday = new Date(monday);
			sunday.setDate(monday.getDate() + 6);
			return { fromDate: toLocalDateStr(monday), toDate: toLocalDateStr(sunday) };
		}
		case "lastWeek": {
			const day = now.getDay();
			const diffToMon = (day === 0 ? -6 : 1 - day) - 7;
			const monday = new Date(now);
			monday.setDate(now.getDate() + diffToMon);
			const sunday = new Date(monday);
			sunday.setDate(monday.getDate() + 6);
			return { fromDate: toLocalDateStr(monday), toDate: toLocalDateStr(sunday) };
		}
		case "lastMonth": {
			const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
			const to = new Date(now.getFullYear(), now.getMonth(), 0);
			return { fromDate: toLocalDateStr(from), toDate: toLocalDateStr(to) };
		}
		case "allTime": {
			return { fromDate: "", toDate: "" };
		}
		default:
			return { fromDate: "", toDate: "" };
	}
}

function DashboardFilters({ filters, setFilters, activePreset, setActivePreset }) {
	const { admin } = useAuth();
	const [showCustomDates, setShowCustomDates] = useState(activePreset === "custom");

	const handlePresetClick = (presetKey) => {
		setActivePreset(presetKey);
		if (presetKey === "custom") {
			setShowCustomDates(true);
		} else {
			setShowCustomDates(false);
			const range = getDatePresetRange(presetKey);
			setFilters((prev) => ({
				...prev,
				fromDate: range.fromDate,
				toDate: range.toDate,
			}));
		}
	};

	const handleCustomDateChange = (e) => {
		const { name, value } = e.target;
		setFilters((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleLocationChange = useCallback(
		(e) => {
			const { value } = e.target;
			setFilters((prev) => ({ ...prev, location: value }));
		},
		[setFilters]
	);

	const handleStatusChange = (e) => {
		const { value } = e.target;
		setFilters((prev) => ({ ...prev, status: value }));
	};

	const handleReset = () => {
		setActivePreset("thisMonth");
		setShowCustomDates(false);
		const defaultRange = getDatePresetRange("thisMonth");
		setFilters({
			fromDate: defaultRange.fromDate,
			toDate: defaultRange.toDate,
			location: "",
			status: "booked",
		});
	};

	const presets = [
		{ key: "thisMonth", label: "This Month" },
		{ key: "thisWeek", label: "This Week" },
		{ key: "lastWeek", label: "Last Week" },
		{ key: "lastMonth", label: "Last Month" },
		{ key: "allTime", label: "All Time" },
		{ key: "custom", label: "Custom Range" },
	];

	return (
		<div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-3 py-2">
			{/* Preset Pills */}
			<div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200">
				{presets.map((p) => {
					const isActive = activePreset === p.key;
					return (
						<button
							key={p.key}
							type="button"
							onClick={() => handlePresetClick(p.key)}
							className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
								isActive
									? "bg-white text-blue-600 shadow-sm border border-gray-200"
									: "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
							}`}
						>
							{p.label}
						</button>
					);
				})}
			</div>

			{/* Secondary Filters: Location (SuperAdmin), Status, and Custom Dates */}
			<div className="flex flex-wrap items-center gap-2.5">
				{/* Custom Date Pickers */}
				{showCustomDates && (
					<div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-gray-300 shadow-sm text-xs">
						<div className="flex items-center gap-1">
							<span className="text-gray-400 font-medium">From:</span>
							<input
								type="date"
								name="fromDate"
								value={filters.fromDate || ""}
								onChange={handleCustomDateChange}
								className="border-none p-0 text-xs font-medium text-gray-700 focus:outline-none focus:ring-0"
							/>
						</div>
						<span className="text-gray-300">|</span>
						<div className="flex items-center gap-1">
							<span className="text-gray-400 font-medium">To:</span>
							<input
								type="date"
								name="toDate"
								value={filters.toDate || ""}
								onChange={handleCustomDateChange}
								className="border-none p-0 text-xs font-medium text-gray-700 focus:outline-none focus:ring-0"
							/>
						</div>
					</div>
				)}

				{/* Location Filter (SuperAdmin only) */}
				{admin?.superAdmin && (
					<div className="min-w-[150px] flex items-center">
						<LocationOptions
							value={filters.location}
							changeHandler={handleLocationChange}
							all={true}
							label=""
							selectClassName="h-[34px] border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all cursor-pointer w-full"
						/>
					</div>
				)}

				{/* Booking Status Dropdown */}
				<select
					name="status"
					value={filters.status || "all"}
					onChange={handleStatusChange}
					className="h-[34px] border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all cursor-pointer"
				>
					<option value="booked">Booked Only</option>
					<option value="all">All Statuses</option>
					<option value="pending">Pending</option>
					<option value="cancelled">Cancelled</option>
				</select>

				{/* Reset Button */}
				<button
					type="button"
					onClick={handleReset}
					className="h-[34px] px-3 flex items-center justify-center text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 bg-white shadow-sm"
					title="Reset to default filters"
				>
					Reset
				</button>
			</div>
		</div>
	);
}

export default DashboardFilters;
