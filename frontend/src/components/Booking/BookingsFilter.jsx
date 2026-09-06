import React, { useState } from "react";
import { Search, X, RotateCcw } from "lucide-react";
import LocationOptions from "../Locations/LocationOptions";
import { useAuth } from "../../hooks/useAuth";
import { getDatePresetRange } from "../Dashboard/DashboardFilters";

function toLocalDateStr(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function BookingsFilter({ params, setParams }) {
	const { admin } = useAuth();
	const isSuperAdmin = admin?.role === "superAdmin" || Boolean(admin?.superAdmin);

	const searchTerm = params.get("search") || "";
	const fromDate = params.get("fromDate") || "";
	const toDate = params.get("toDate") || "";
	const status = params.get("status") || "";

	// Detect current active preset
	const todayStr = toLocalDateStr(new Date());
	const thisWeekRange = getDatePresetRange("thisWeek");
	const thisMonthRange = getDatePresetRange("thisMonth");
	const lastMonthRange = getDatePresetRange("lastMonth");

	let currentPreset = "allTime";
	if (!fromDate && !toDate) {
		currentPreset = "allTime";
	} else if (fromDate === todayStr && toDate === todayStr) {
		currentPreset = "today";
	} else if (fromDate === thisWeekRange.fromDate && toDate === thisWeekRange.toDate) {
		currentPreset = "thisWeek";
	} else if (fromDate === thisMonthRange.fromDate && toDate === thisMonthRange.toDate) {
		currentPreset = "thisMonth";
	} else if (fromDate === lastMonthRange.fromDate && toDate === lastMonthRange.toDate) {
		currentPreset = "lastMonth";
	} else if (fromDate || toDate) {
		currentPreset = "custom";
	}

	const [showCustomDates, setShowCustomDates] = useState(currentPreset === "custom");

	const handlePresetClick = (presetKey) => {
		const newParams = new URLSearchParams(params);
		newParams.set("page", "1");

		if (presetKey === "custom") {
			setShowCustomDates(true);
			return;
		}

		setShowCustomDates(false);

		if (presetKey === "today") {
			newParams.set("fromDate", todayStr);
			newParams.set("toDate", todayStr);
		} else if (presetKey === "thisWeek") {
			newParams.set("fromDate", thisWeekRange.fromDate);
			newParams.set("toDate", thisWeekRange.toDate);
		} else if (presetKey === "thisMonth") {
			newParams.set("fromDate", thisMonthRange.fromDate);
			newParams.set("toDate", thisMonthRange.toDate);
		} else if (presetKey === "lastMonth") {
			newParams.set("fromDate", lastMonthRange.fromDate);
			newParams.set("toDate", lastMonthRange.toDate);
		} else if (presetKey === "allTime") {
			newParams.delete("fromDate");
			newParams.delete("toDate");
		}

		setParams(newParams);
	};

	const handleSearchChange = (e) => {
		const value = e.target.value;
		const newParams = new URLSearchParams(params);
		if (value) {
			newParams.set("search", value);
		} else {
			newParams.delete("search");
		}
		newParams.set("page", "1");
		setParams(newParams);
	};

	const handleParamChange = (name, value) => {
		const newParams = new URLSearchParams(params);
		if (value) {
			newParams.set(name, value);
		} else {
			newParams.delete(name);
		}
		newParams.set("page", "1");
		setParams(newParams);
	};

	const clearFilters = () => {
		setShowCustomDates(false);
		const newParams = new URLSearchParams();
		setParams(newParams);
	};

	const presets = [
		{ key: "today", label: "Today" },
		{ key: "thisWeek", label: "This Week" },
		{ key: "thisMonth", label: "This Month" },
		{ key: "lastMonth", label: "Last Month" },
		{ key: "allTime", label: "All Time" },
		{ key: "custom", label: "Custom Range" },
	];

	return (
		<div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-3">
			{/* Preset Pills */}
			<div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200">
				{presets.map((p) => {
					const isActive = (showCustomDates && p.key === "custom") || (!showCustomDates && currentPreset === p.key);
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

			{/* Search, Location (SuperAdmin), Status, and Custom Dates */}
			<div className="flex flex-wrap items-center gap-2.5">
				{/* Custom Date Pickers */}
				{showCustomDates && (
					<div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-gray-300 shadow-sm text-xs h-[34px]">
						<div className="flex items-center gap-1">
							<span className="text-gray-400 font-medium">From:</span>
							<input
								type="date"
								value={fromDate}
								onChange={(e) => handleParamChange("fromDate", e.target.value)}
								className="border-none p-0 text-xs font-medium text-gray-700 focus:outline-none focus:ring-0 cursor-pointer"
							/>
						</div>
						<span className="text-gray-300">|</span>
						<div className="flex items-center gap-1">
							<span className="text-gray-400 font-medium">To:</span>
							<input
								type="date"
								value={toDate}
								onChange={(e) => handleParamChange("toDate", e.target.value)}
								className="border-none p-0 text-xs font-medium text-gray-700 focus:outline-none focus:ring-0 cursor-pointer"
							/>
						</div>
					</div>
				)}

				{/* Search Input */}
				<div className="relative min-w-[200px] sm:min-w-[240px]">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
						<Search className="w-3.5 h-3.5" />
					</div>
					<input
						type="text"
						value={searchTerm}
						onChange={handleSearchChange}
						placeholder="Search customer, phone, or ID..."
						className="w-full pl-8 pr-7 h-[34px] text-xs rounded-lg border border-gray-300 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
					/>
					{searchTerm && (
						<button
							type="button"
							onClick={() => handleParamChange("search", "")}
							className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
						>
							<X className="w-3.5 h-3.5" />
						</button>
					)}
				</div>

				{/* SuperAdmin Branch Location Filter */}
				{isSuperAdmin && (
					<div className="min-w-[150px] flex items-center">
						<LocationOptions
							params={params}
							setParams={setParams}
							all={true}
							label=""
							selectClassName="h-[34px] border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all cursor-pointer w-full"
						/>
					</div>
				)}

				{/* Status Filter */}
				<select
					value={status}
					onChange={(e) => handleParamChange("status", e.target.value)}
					className="h-[34px] border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all cursor-pointer"
				>
					<option value="">All Statuses</option>
					<option value="booked">Confirmed (Booked)</option>
					<option value="pending">Pending Payment</option>
					<option value="canceled">Canceled</option>
				</select>

				{/* Reset Button */}
				<button
					type="button"
					onClick={clearFilters}
					className="h-[34px] px-3 flex items-center justify-center text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 bg-white shadow-sm"
					title="Reset all filters"
				>
					Reset
				</button>
			</div>
		</div>
	);
}

export default BookingsFilter;
