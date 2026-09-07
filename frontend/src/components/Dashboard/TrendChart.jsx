import React, { useState, useMemo, useRef } from "react";

function TrendChart({ timeline = [], title = "Revenue & Bookings Trajectory" }) {
	const [hoveredPoint, setHoveredPoint] = useState(null);
	const svgRef = useRef(null);

	const sortedTimeline = useMemo(() => {
		return [...timeline].sort((a, b) => new Date(a.date) - new Date(b.date));
	}, [timeline]);

	const { maxRevenue, totalPeriodRevenue, peakDay } = useMemo(() => {
		if (sortedTimeline.length === 0) {
			return { maxRevenue: 1, totalPeriodRevenue: 0, peakDay: null };
		}
		let maxRev = 0;
		let total = 0;
		let peak = sortedTimeline[0];

		sortedTimeline.forEach((pt) => {
			const rev = Number(pt.revenue || 0);
			total += rev;
			if (rev > maxRev) {
				maxRev = rev;
				peak = pt;
			}
		});

		return {
			maxRevenue: maxRev > 0 ? maxRev : 1,
			totalPeriodRevenue: total,
			peakDay: peak,
		};
	}, [sortedTimeline]);

	if (sortedTimeline.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm font-sans">
				<svg className="w-12 h-12 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
				</svg>
				<p>No revenue trajectory data for the selected period</p>
			</div>
		);
	}

	const chartWidth = 640;
	const chartHeight = 220;
	const paddingLeft = 55;
	const paddingRight = 25;
	const paddingTop = 20;
	const paddingBottom = 35;

	const plotWidth = chartWidth - paddingLeft - paddingRight;
	const plotHeight = chartHeight - paddingTop - paddingBottom;

	// Calculate point coordinates
	const points = useMemo(() => {
		return sortedTimeline.map((item, index) => {
			const x =
				sortedTimeline.length === 1
					? paddingLeft + plotWidth / 2
					: paddingLeft + (index / (sortedTimeline.length - 1)) * plotWidth;
			const y = paddingTop + plotHeight - ((item.revenue || 0) / maxRevenue) * plotHeight;
			return { ...item, x, y, index };
		});
	}, [sortedTimeline, maxRevenue, plotWidth, plotHeight]);

	// Build smooth SVG area path and clean line path without point indicators
	const { linePath, areaPath } = useMemo(() => {
		if (points.length === 0) return { linePath: "", areaPath: "" };
		if (points.length === 1) {
			const l = `M ${points[0].x - 15} ${points[0].y} L ${points[0].x + 15} ${points[0].y}`;
			return { linePath: l, areaPath: "" };
		}
		const l = points.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), "");
		const a = `${l} L ${points[points.length - 1].x} ${paddingTop + plotHeight} L ${points[0].x} ${
			paddingTop + plotHeight
		} Z`;
		return { linePath: l, areaPath: a };
	}, [points, plotHeight]);

	// Format dates for X-axis: pick exactly 5-6 evenly spaced labels across the timeline to prevent overlap
	const axisLabels = useMemo(() => {
		if (points.length === 0) return [];
		if (points.length <= 6) return points;
		const labelCount = Math.min(6, points.length);
		const step = (points.length - 1) / (labelCount - 1);
		const indices = [];
		for (let i = 0; i < labelCount; i++) {
			indices.push(Math.round(i * step));
		}
		const uniqueIndices = [...new Set(indices)];
		return uniqueIndices.map((idx) => points[idx]);
	}, [points]);

	const formatAxisDate = (dateStr) => {
		try {
			const d = new Date(dateStr);
			return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
		} catch {
			return dateStr;
		}
	};

	const handleMouseMove = (e) => {
		if (!svgRef.current || points.length === 0) return;
		const rect = svgRef.current.getBoundingClientRect();
		const clientX = e.clientX - rect.left;
		const svgX = (clientX / rect.width) * chartWidth;

		if (svgX < paddingLeft - 10 || svgX > chartWidth - paddingRight + 10) {
			setHoveredPoint(null);
			return;
		}

		let closest = points[0];
		let minDiff = Math.abs(points[0].x - svgX);
		for (let i = 1; i < points.length; i++) {
			const diff = Math.abs(points[i].x - svgX);
			if (diff < minDiff) {
				minDiff = diff;
				closest = points[i];
			} else if (points[i].x > svgX) {
				break;
			}
		}
		setHoveredPoint(closest);
	};

	const handleMouseLeave = () => {
		setHoveredPoint(null);
	};

	return (
		<div className="w-full font-sans select-none">
			{/* Top Metric Header */}
			<div className="flex items-center justify-between mb-3 px-1">
				<div>
					<p className="text-xs text-gray-500 font-medium">{title}</p>
					<h4 className="text-lg font-bold text-gray-900">
						₹{totalPeriodRevenue.toLocaleString("en-IN")}
						<span className="text-xs font-normal text-gray-500 ml-2">in period</span>
					</h4>
				</div>
				{peakDay && (
					<div className="text-right">
						<span className="text-[11px] text-gray-400 block">Peak Day</span>
						<span className="text-xs font-semibold text-emerald-600">
							₹{Number(peakDay.revenue || 0).toLocaleString("en-IN")} ({formatAxisDate(peakDay.date)})
						</span>
					</div>
				)}
			</div>

			{/* SVG Chart */}
			<div className="relative w-full overflow-hidden">
				<svg
					ref={svgRef}
					viewBox={`0 0 ${chartWidth} ${chartHeight}`}
					className="w-full h-auto overflow-visible cursor-crosshair"
					onMouseMove={handleMouseMove}
					onMouseLeave={handleMouseLeave}
				>
					<defs>
						<linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
							<stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
						</linearGradient>
					</defs>

					{/* Y-axis horizontal grid lines */}
					{[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
						const y = paddingTop + plotHeight * (1 - ratio);
						const val = Math.round(maxRevenue * ratio);
						return (
							<g key={ratio}>
								<line
									x1={paddingLeft}
									y1={y}
									x2={chartWidth - paddingRight}
									y2={y}
									stroke="#E5E7EB"
									strokeDasharray="4 4"
									strokeWidth="1"
								/>
								<text
									x={paddingLeft - 8}
									y={y + 3}
									textAnchor="end"
									className="text-[10px] fill-gray-400 font-mono"
								>
									₹{val >= 1000 ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k` : val}
								</text>
							</g>
						);
					})}

					{/* Area under line */}
					{areaPath && <path d={areaPath} fill="url(#areaGradient)" />}

					{/* Clean Trend Line (No point indicators / dots along the line) */}
					<path
						d={linePath}
						fill="none"
						stroke="#2563EB"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>

					{/* Active Hover Guide Line and Single Focal Point */}
					{hoveredPoint && (
						<g className="pointer-events-none">
							<line
								x1={hoveredPoint.x}
								y1={paddingTop}
								x2={hoveredPoint.x}
								y2={paddingTop + plotHeight}
								stroke="#93C5FD"
								strokeWidth="1.5"
								strokeDasharray="3 3"
							/>
							{/* Soft background aura */}
							<circle
								cx={hoveredPoint.x}
								cy={hoveredPoint.y}
								r="7"
								fill="#3B82F6"
								fillOpacity="0.2"
							/>
							{/* Highlighted active point indicator */}
							<circle
								cx={hoveredPoint.x}
								cy={hoveredPoint.y}
								r="4.5"
								fill="#2563EB"
								stroke="#FFFFFF"
								strokeWidth="2.5"
							/>
						</g>
					)}

					{/* Transparent overlay covering the plot area for smooth mouse tracking */}
					<rect
						x={paddingLeft}
						y={paddingTop}
						width={plotWidth}
						height={plotHeight}
						fill="transparent"
					/>

					{/* X-axis date labels: evenly spaced, non-colliding */}
					{axisLabels.map((pt, i) => {
						const isFirst = i === 0;
						const isLast = i === axisLabels.length - 1;
						const textAnchor = isFirst ? "start" : isLast ? "end" : "middle";
						return (
							<text
								key={i}
								x={pt.x}
								y={chartHeight - 10}
								textAnchor={textAnchor}
								className="text-[10px] fill-gray-400 font-sans select-none"
							>
								{formatAxisDate(pt.date)}
							</text>
						);
					})}
				</svg>

				{/* Floating Tooltip */}
				{hoveredPoint && (() => {
					const leftPct = (hoveredPoint.x / chartWidth) * 100;
					const isFarLeft = leftPct < 15;
					const isFarRight = leftPct > 85;
					const transformStyle = isFarLeft
						? "translate(0%, -100%)"
						: isFarRight
						? "translate(-100%, -100%)"
						: "translate(-50%, -100%)";

					return (
						<div
							className="absolute bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-xl pointer-events-none z-20 transition-all duration-75"
							style={{
								left: `${leftPct}%`,
								top: `${Math.max(6, (hoveredPoint.y / chartHeight) * 100 - 6)}%`,
								transform: transformStyle,
							}}
						>
							<p className="font-semibold text-gray-200 text-[11px] font-sans">
								{formatAxisDate(hoveredPoint.date)}
							</p>
							<p className="text-emerald-400 font-bold font-sans text-xs">
								₹{Number(hoveredPoint.revenue || 0).toLocaleString("en-IN")}
							</p>
							<p className="text-gray-300 text-[10px] font-sans">
								{hoveredPoint.bookings || 0} booking{(hoveredPoint.bookings || 0) !== 1 ? "s" : ""}
							</p>
						</div>
					);
				})()}
			</div>
		</div>
	);
}

export default TrendChart;
