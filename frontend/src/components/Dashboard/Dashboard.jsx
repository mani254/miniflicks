import React, { useState, useMemo } from "react";
import DonutChart from "./DonutChart";
import TrendChart from "./TrendChart";
import DashboardFilters, { getDatePresetRange } from "./DashboardFilters";
import { useNavigate } from "react-router-dom";
import { convert12Hours } from "../../utils";
import { useAuth } from "../../hooks/useAuth";
import { useBookings, useDashboardInfo, useGraphData } from "../../hooks/useBookings";
import { useLocation } from "../../hooks/useCatalog";
import { getImageUrl } from "../../lib/imageUrl";
import {
	IndianRupee,
	CalendarCheck,
	CalendarDays,
	Tv,
	MapPin,
	Building2,
	Eye,
	Clock,
	ShieldCheck,
	Sparkles,
	TrendingUp,
} from "lucide-react";

function Dashboard() {
	const { admin } = useAuth();
	const navigate = useNavigate();

	// Default active preset is "thisMonth"
	const [activePreset, setActivePreset] = useState("thisMonth");

	// Initialize filters with "thisMonth" date range
	const [filters, setFilters] = useState(() => {
		const range = getDatePresetRange("thisMonth");
		return {
			fromDate: range.fromDate,
			toDate: range.toDate,
			location: "",
			status: "booked",
		};
	});

	// Resolved location ID for Location Admin
	const locationId = admin?.locationId || admin?.location;
	const { data: singleLocation, isLoading: locationLoading } = useLocation(locationId);

	// Scoped params for dashboard metrics and graph
	const metricsParams = useMemo(() => {
		const params = { ...filters };
		if (!admin?.superAdmin && locationId) {
			params.location = locationId;
		}
		return params;
	}, [filters, admin, locationId]);

	const graphParams = useMemo(() => {
		const params = {};
		if (filters.fromDate) params.fromDate = filters.fromDate;
		if (filters.toDate) params.toDate = filters.toDate;
		if (admin?.superAdmin) {
			if (filters.location) params.location = filters.location;
		} else if (locationId) {
			params.location = locationId;
		}
		return params;
	}, [filters.fromDate, filters.toDate, filters.location, admin, locationId]);

	// Upcoming bookings params (Next 3 days)
	const upcomingParams = useMemo(() => {
		const now = new Date();
		const fromDate = new Date(now);
		fromDate.setHours(0, 0, 0, 0);

		const toDate = new Date(now);
		toDate.setDate(fromDate.getDate() + 3);
		toDate.setHours(23, 59, 59, 999);

		return {
			fromDate: fromDate.toISOString(),
			toDate: toDate.toISOString(),
			location: admin?.superAdmin ? filters.location || undefined : locationId,
			limit: 15,
		};
	}, [filters.location, admin, locationId]);

	// React Query hooks
	const { data: dashboardInfo, isLoading: countLoading } = useDashboardInfo(metricsParams);
	const { data: graphResponse, isLoading: graphLoading } = useGraphData(graphParams);
	const { data: upcomingData, isLoading: bookingsLoading } = useBookings(upcomingParams);

	const upcomingBookings = upcomingData?.bookings || [];

	// Parse graph distribution and timeline data
	const distributionData = graphResponse?.distribution || [];
	const timelineData = graphResponse?.timeline || [];
	const graphType = graphResponse?.type || (admin?.superAdmin && !filters.location ? "location" : "screen");

	// KPI Cards configuration
	const kpiCards = useMemo(() => {
		const info = dashboardInfo || {};
		const totalIncome = Number(info.totalIncome || 0);
		const pendingAmount = Number(info.pendingAmount || 0);
		const advanceAmount = Number(info.advanceAmount || (totalIncome - pendingAmount));
		const currentAmount = Number(info.currentAmount || (totalIncome - pendingAmount));

		const cards = [
			{
				title: "Total Revenue",
				value: `₹${totalIncome.toLocaleString("en-IN")}`,
				subtitle: activePreset === "allTime" ? "All time" : "In selected period",
				icon: IndianRupee,
				iconColor: "text-emerald-600 bg-emerald-50",
				accentColor: "border-l-emerald-500",
			},
			{
				title: "Advance Collected",
				value: `₹${advanceAmount.toLocaleString("en-IN")}`,
				subtitle: "Realized cash",
				icon: TrendingUp,
				iconColor: "text-blue-600 bg-blue-50",
				accentColor: "border-l-blue-500",
			},
			{
				title: "Pending Balance",
				value: `₹${pendingAmount.toLocaleString("en-IN")}`,
				subtitle: "To collect at venue",
				icon: Clock,
				iconColor: "text-amber-600 bg-amber-50",
				accentColor: "border-l-amber-500",
			},
			{
				title: "Total Bookings",
				value: Number(info.totalBookings || 0).toLocaleString("en-IN"),
				subtitle: activePreset === "allTime" ? "All bookings" : "In selected period",
				icon: CalendarCheck,
				iconColor: "text-indigo-600 bg-indigo-50",
				accentColor: "border-l-indigo-500",
			},
			{
				title: "Today's Bookings",
				value: Number(info.todayBookings || 0).toLocaleString("en-IN"),
				subtitle: "Scheduled for today",
				icon: CalendarDays,
				iconColor: "text-rose-600 bg-rose-50",
				accentColor: "border-l-rose-500",
			},
			{
				title: "Active Screens",
				value: Number(info.totalScreens || 0).toLocaleString("en-IN"),
				subtitle: admin?.superAdmin && !filters.location ? "Across all locations" : "In this location",
				icon: Tv,
				iconColor: "text-cyan-600 bg-cyan-50",
				accentColor: "border-l-cyan-500",
			},
		];

		if (admin?.superAdmin && !filters.location && (info.totalLocations > 0 || info.totalCities > 0)) {
			cards.push({
				title: "Active Locations",
				value: Number(info.totalLocations || 0).toLocaleString("en-IN"),
				subtitle: "Operating branches",
				icon: MapPin,
				iconColor: "text-violet-600 bg-violet-50",
				accentColor: "border-l-violet-500",
			});
			cards.push({
				title: "Active Cities",
				value: Number(info.totalCities || 0).toLocaleString("en-IN"),
				subtitle: "Operating cities",
				icon: Building2,
				iconColor: "text-orange-600 bg-orange-50",
				accentColor: "border-l-orange-500",
			});
		}

		return cards;
	}, [dashboardInfo, activePreset, admin, filters.location]);

	return (
		<div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
			{/* Top Header & Role Banner */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
				<div>
					<div className="flex items-center gap-2.5">
						<h1 className="text-xl font-bold font-sans text-gray-900 tracking-tight">
							{admin?.superAdmin ? "Super Admin Console" : (singleLocation?.name || "Branch Dashboard")}
						</h1>
						<span
							className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
								admin?.superAdmin
									? "bg-purple-100 text-purple-800"
									: "bg-blue-100 text-blue-800"
							}`}
						>
							{admin?.superAdmin ? (
								<>
									<ShieldCheck className="w-3.5 h-3.5 mr-1" />
									Super Admin
								</>
							) : (
								<>
									<MapPin className="w-3.5 h-3.5 mr-1" />
									Branch Admin
								</>
							)}
						</span>
					</div>
					<p className="text-xs text-gray-500 mt-0.5">
						{admin?.superAdmin
							? "Real-time enterprise overview, revenue analytics, and branch operations."
							: `Managing private screening slots and operations for ${singleLocation?.name || "this location"}.`}
					</p>
				</div>

				{/* Location Admin Branch Snapshot Badge */}
				{!admin?.superAdmin && singleLocation && (
					<div className="flex items-center gap-3 bg-white border border-gray-200 shadow-sm rounded-xl px-3 py-2">
						{singleLocation.image ? (
							<img
								src={getImageUrl(singleLocation.image)}
								alt={singleLocation.name}
								className="w-10 h-10 rounded-lg object-cover border border-gray-100"
							/>
						) : (
							<div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
								{singleLocation.name?.slice(0, 2).toUpperCase()}
							</div>
						)}
						<div className="text-xs">
							<p className="font-bold text-gray-800">{singleLocation.name}</p>
							<p className="text-gray-500 text-[11px] truncate max-w-[200px]">{singleLocation.address}</p>
						</div>
					</div>
				)}
			</div>

			{/* Advanced Interactive Filters */}
			<div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-sm">
				<DashboardFilters
					filters={filters}
					setFilters={setFilters}
					activePreset={activePreset}
					setActivePreset={setActivePreset}
				/>
			</div>

			{/* KPI Summary Cards Grid: Balanced 4x2 for SuperAdmin (8 cards) or 3x2 for Location Admin (6 cards) */}
			<div
				className={`grid grid-cols-2 sm:grid-cols-2 ${
					kpiCards.length === 8 ? "lg:grid-cols-4" : "lg:grid-cols-3"
				} gap-4`}
			>
				{kpiCards.map((card, idx) => {
					const Icon = card.icon;
					return (
						<div
							key={idx}
							className={`bg-white rounded-2xl p-4 border border-gray-200 border-l-4 ${card.accentColor} shadow-sm hover:shadow transition-all flex flex-col justify-between`}
						>
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
									{card.title}
								</span>
								<span className={`p-1.5 rounded-lg ${card.iconColor}`}>
									<Icon className="w-4 h-4" />
								</span>
							</div>
							{countLoading ? (
								<div className="h-7 bg-gray-200 animate-pulse rounded my-1 w-24"></div>
							) : (
								<div className="text-xl font-extrabold text-gray-900 tracking-tight">
									{card.value}
								</div>
							)}
							<p className="text-[11px] text-gray-400 mt-1 truncate">{card.subtitle}</p>
						</div>
					);
				})}
			</div>

			{/* Analytics Section: Distribution Donut & Revenue Trajectory Trend */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
				{/* Distribution Donut Card */}
				<div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
					<div>
						<div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
							<div>
								<h3 className="font-sans text-sm font-bold text-gray-900">
									{graphType === "location" ? "Location Breakdown" : "Screen Breakdown"}
								</h3>
								<p className="font-sans text-[11px] text-gray-400">
									{graphType === "location"
										? "Revenue share by branch"
										: `Screen share for ${singleLocation?.name || "selected branch"}`}
								</p>
							</div>
							<span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-sans">
								{distributionData.length} {graphType === "location" ? "branches" : "screens"}
							</span>
						</div>

						{graphLoading ? (
							<div className="h-64 flex items-center justify-center">
								<div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
							</div>
						) : (
							<DonutChart
								data={distributionData}
								title={graphType === "location" ? "Locations" : "Screens"}
								centerLabel="Revenue"
								centerValue={`₹${Number(dashboardInfo?.totalIncome || 0).toLocaleString("en-IN")}`}
								emptyMessage={`No ${graphType} revenue for this period`}
							/>
						)}
					</div>
				</div>

				{/* Revenue & Bookings Trajectory Card */}
				<div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
					<div className="pb-3 mb-2 border-b border-gray-100 flex items-center justify-between">
						<div>
							<h3 className="font-sans text-sm font-bold text-gray-900">Revenue & Bookings Trajectory</h3>
							<p className="font-sans text-[11px] text-gray-400">
								Daily income velocity and booking volume across the selected filter period
							</p>
						</div>
						<span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-sans">
							<Sparkles className="w-3 h-3" />
							Live Trend
						</span>
					</div>

					{graphLoading ? (
						<div className="h-64 flex items-center justify-center">
							<div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
						</div>
					) : (
						<TrendChart timeline={timelineData} title="Period Revenue" />
					)}
				</div>
			</div>

			{/* Upcoming Bookings Table Section */}
			<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
				<div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
					<div>
						<h3 className="font-sans text-base font-bold text-gray-900">Upcoming Bookings</h3>
						<p className="font-sans text-xs text-gray-500">
							Arrivals scheduled for the next 3 days
							{!admin?.superAdmin && singleLocation ? ` at ${singleLocation.name}` : ""}
						</p>
					</div>
					<button
						type="button"
						onClick={() => navigate("/admin/bookings")}
						className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
					>
						View All Bookings &rarr;
					</button>
				</div>

				{bookingsLoading ? (
					<div className="p-8 text-center">
						<div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
						<p className="text-xs text-gray-400">Loading scheduled bookings...</p>
					</div>
				) : upcomingBookings.length === 0 ? (
					<div className="p-10 text-center text-gray-400">
						<CalendarDays className="w-10 h-10 mx-auto mb-2 text-gray-300" />
						<p className="text-sm font-medium">No bookings scheduled for the next 3 days</p>
						<p className="text-xs text-gray-400 mt-0.5">Any new bookings will appear here automatically.</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs text-gray-600">
							<thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100 uppercase text-[10px] tracking-wider">
								<tr>
									<th className="py-3 px-4">#</th>
									<th className="py-3 px-4">Customer</th>
									<th className="py-3 px-4">Screen & Location</th>
									<th className="py-3 px-4">Date & Slot</th>
									<th className="py-3 px-4 text-right">Total Price</th>
									<th className="py-3 px-4 text-right">Advance Paid</th>
									<th className="py-3 px-4 text-right">Balance Due</th>
									<th className="py-3 px-4 text-center">Status</th>
									<th className="py-3 px-4 text-center">Action</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{upcomingBookings.map((booking, idx) => {
									const isToday =
										new Date(booking.date).toDateString() === new Date().toDateString();

									return (
										<tr
											key={booking._id}
											onClick={() => navigate(`/admin/bookings/view/${booking._id}`)}
											className="hover:bg-blue-50/40 cursor-pointer transition-colors"
										>
											<td className="py-3 px-4 font-medium text-gray-400">{idx + 1}</td>
											<td className="py-3 px-4">
												<div className="font-semibold text-gray-800">
													{booking.customer?.name || "Walk-in Guest"}
												</div>
												<div className="text-[11px] text-gray-400">
													{booking.customer?.number || "-"}
												</div>
											</td>
											<td className="py-3 px-4">
												<div className="font-medium text-gray-800">
													{booking.screen?.name || "Screen"}
												</div>
												<div className="text-[11px] text-gray-400">
													{booking.location?.name || "-"}
												</div>
											</td>
											<td className="py-3 px-4">
												<div className="flex items-center gap-1.5">
													<span
														className={`font-semibold ${
															isToday ? "text-rose-600 font-bold" : "text-gray-800"
														}`}
													>
														{new Date(booking.date).toLocaleDateString("en-IN", {
															month: "short",
															day: "numeric",
															year: "numeric",
														})}
													</span>
													{isToday && (
														<span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.2 rounded font-bold">
															TODAY
														</span>
													)}
												</div>
												<div className="text-[11px] text-gray-400">
													{booking.slot?.from && booking.slot?.to
														? `${convert12Hours(booking.slot.from)} - ${convert12Hours(
																booking.slot.to
														  )}`
														: "-"}
												</div>
											</td>
											<td className="py-3 px-4 text-right font-mono font-semibold text-gray-800">
												₹{Number(booking.totalPrice || 0).toLocaleString("en-IN")}
											</td>
											<td className="py-3 px-4 text-right font-mono font-medium text-emerald-600">
												₹{Number(booking.advancePrice || 0).toLocaleString("en-IN")}
											</td>
											<td className="py-3 px-4 text-right font-mono font-medium text-amber-600">
												₹{Number(booking.remainingAmount || 0).toLocaleString("en-IN")}
											</td>
											<td className="py-3 px-4 text-center">
												<span
													className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
														booking.status === "booked"
															? "bg-emerald-100 text-emerald-800"
															: booking.status === "pending"
															? "bg-amber-100 text-amber-800"
															: "bg-red-100 text-red-800"
													}`}
												>
													{booking.status || "booked"}
												</span>
											</td>
											<td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
												<button
													type="button"
													onClick={() => navigate(`/admin/bookings/view/${booking._id}`)}
													className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
													title="View Booking Details"
												>
													<Eye className="w-4 h-4" />
												</button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}

export default Dashboard;
