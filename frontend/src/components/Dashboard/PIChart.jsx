import React, { useEffect, useRef } from "react";

const PiChart = ({ locationInfo }) => {
	let percentages = [20, 30, 25, 35];

	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");

		const canvasSize = Math.min(canvas.width, canvas.height);
		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;
		const radius = canvasSize * 0.43;

		const bgCircleRadius = radius * 0.7;
		const bgColor = "#f0f0f0";

		const angles = [];
		let startAngle = -Math.PI / 2;

		for (let i = 0; i < locationInfo.length; i++) {
			const angle = (locationInfo[i].percentage / 100) * 2 * Math.PI;
			angles.push(angle);
		}

		for (let i = 0; i < angles.length; i++) {
			const endAngle = startAngle + angles[i];

			ctx.beginPath();
			ctx.moveTo(centerX, centerY);
			ctx.arc(centerX, centerY, radius, startAngle, endAngle);
			ctx.closePath();

			ctx.fillStyle = locationInfo[i].color;
			ctx.fill();

			startAngle = endAngle;
		}

		ctx.beginPath();
		ctx.arc(centerX, centerY, bgCircleRadius, 0, 2 * Math.PI);
		ctx.fillStyle = bgColor;
		ctx.fill();
	}, [percentages]);

	return <canvas ref={canvasRef} width={200} height={200}></canvas>;
};

export default PiChart;
