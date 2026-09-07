import React, { useState } from "react";

function DonutChart({
	data = [],
	title = "Revenue Distribution",
	centerLabel = "Total",
	centerValue = "",
	emptyMessage = "No distribution data available",
}) {
	const [hoveredIndex, setHoveredIndex] = useState(null);

	const validData = (data || []).filter((item) => (item.percentage || 0) > 0 || (item.totalAmount || 0) > 0);

	if (validData.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm">
				<svg className="w-12 h-12 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
				</svg>
				<p>{emptyMessage}</p>
			</div>
		);
	}

	const radius = 68;
	const strokeWidth = 24;
	const circumference = 2 * Math.PI * radius;

	let accumulatedPercent = 0;

	// Curated modern color palette
	const defaultColors = [
		"#3B82F6", // Blue
		"#8B5CF6", // Purple
		"#10B981", // Emerald
		"#F59E0B", // Amber
		"#EF4444", // Rose
		"#EC4899", // Pink
		"#06B6D4", // Cyan
		"#6366F1", // Indigo
	];

	const coloredData = validData.map((item, idx) => ({
		...item,
		color: item.color || defaultColors[idx % defaultColors.length],
	}));

	const activeItem = hoveredIndex !== null ? coloredData[hoveredIndex] : null;

	return (
		<div className="flex flex-col items-center w-full font-sans">
			<div className="relative w-48 h-48 my-2">
				<svg viewBox="0 0 180 180" className="w-full h-full transform -rotate-90">
					{/* Background track */}
					<circle
						cx="90"
						cy="90"
						r={radius}
						fill="transparent"
						stroke="#F3F4F6"
						strokeWidth={strokeWidth}
					/>

					{/* Slices */}
					{coloredData.map((slice, idx) => {
						const strokeLength = (slice.percentage / 100) * circumference;
						const strokeOffset = circumference - (accumulatedPercent / 100) * circumference;
						accumulatedPercent += slice.percentage;

						const isHovered = hoveredIndex === idx;

						return (
							<circle
								key={idx}
								cx="90"
								cy="90"
								r={radius}
								fill="transparent"
								stroke={slice.color}
								strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
								strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
								strokeDashoffset={strokeOffset}
								strokeLinecap="round"
								className="transition-all duration-300 cursor-pointer"
								style={{
									filter: isHovered ? "drop-shadow(0 4px 6px rgba(0,0,0,0.15))" : "none",
								}}
								onMouseEnter={() => setHoveredIndex(idx)}
								onMouseLeave={() => setHoveredIndex(null)}
							/>
						);
					})}
				</svg>

				{/* Center Content */}
				<div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
					<span className="text-[11px] uppercase tracking-wider text-gray-400 font-medium truncate max-w-[110px]">
						{activeItem ? activeItem.name : centerLabel}
					</span>
					<span className="text-base font-bold text-gray-800 truncate max-w-[120px]">
						{activeItem
							? `₹${Number(activeItem.totalAmount || 0).toLocaleString("en-IN")}`
							: centerValue}
					</span>
					{activeItem && (
						<span className="text-[11px] font-semibold text-blue-600">
							{activeItem.percentage}% ({activeItem.bookingsCount || 0} bkg)
						</span>
					)}
				</div>
			</div>

			{/* Legend */}
			<div className="w-full mt-3 grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto px-1">
				{coloredData.map((slice, idx) => {
					const isHovered = hoveredIndex === idx;
					return (
						<div
							key={idx}
							onMouseEnter={() => setHoveredIndex(idx)}
							onMouseLeave={() => setHoveredIndex(null)}
							className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
								isHovered ? "bg-gray-100 font-semibold" : "hover:bg-gray-50 text-gray-700"
							}`}
						>
							<div className="flex items-center space-x-2 min-w-0">
								<span
									className="w-2.5 h-2.5 rounded-full flex-shrink-0"
									style={{ backgroundColor: slice.color }}
								/>
								<span className="truncate">{slice.name}</span>
							</div>
							<div className="flex items-center space-x-2 flex-shrink-0 text-right ml-2">
								<span className="text-gray-500 font-mono">
									₹{Number(slice.totalAmount || 0).toLocaleString("en-IN")}
								</span>
								<span className="text-gray-400 text-[11px] font-medium w-10 text-right">
									{slice.percentage}%
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default DonutChart;
