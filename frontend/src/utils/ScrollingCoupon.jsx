import React, { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { useUserCoupons } from "../hooks/useCatalog";

const ScrollingCoupons = () => {
	const containerRef = useRef(null);
	const animationRef = useRef(null);
	const [repeatedCoupons, setRepeatedCoupons] = useState([]);

	const { data: rawCoupons } = useUserCoupons();
	const couponsData = useMemo(() => {
		const list = Array.isArray(rawCoupons)
			? rawCoupons
			: rawCoupons?.coupons && Array.isArray(rawCoupons.coupons)
			? rawCoupons.coupons
			: [];
		const now = new Date();
		return list.filter((c) => {
			const isHeader = Boolean(c.scrollCoupon || c.showInHeader);
			const isActive = c.status !== false;
			const notExpired = c.expireDate ? new Date(c.expireDate) >= now : true;
			return isHeader && isActive && notExpired;
		});
	}, [rawCoupons]);

	const calculateCoupons = () => {
		if (!couponsData || couponsData.length === 0) {
			setRepeatedCoupons([]);
			return;
		}

		const containerWidth = window.innerWidth;

		const sampleCoupon = document.createElement("div");
		sampleCoupon.className = "px-4 py-1 font-semibold";
		sampleCoupon.style.visibility = "hidden";
		sampleCoupon.style.position = "absolute";
		sampleCoupon.style.whiteSpace = "nowrap";
		sampleCoupon.innerText = (couponsData[0].scrollingText || "") + " - " + (couponsData[0].code || "");
		document.body.appendChild(sampleCoupon);

		const couponWidth = sampleCoupon.offsetWidth;
		document.body.removeChild(sampleCoupon);

		if (couponWidth === 0) {
			setRepeatedCoupons([]);
			return;
		}

		const minCount = Math.ceil(containerWidth / couponWidth);
		const newCoupons = [];

		while (newCoupons.length < minCount * 2) {
			newCoupons.push(...couponsData);
		}

		setRepeatedCoupons(newCoupons);
	};

	useEffect(() => {
		calculateCoupons();
		window.addEventListener("resize", calculateCoupons);
		return () => window.removeEventListener("resize", calculateCoupons);
	}, [couponsData]);

	useEffect(() => {
		if (repeatedCoupons.length === 0 || !containerRef.current) return;

		const list = containerRef.current;
		const width = list.scrollWidth / 2;

		gsap.killTweensOf(list);
		gsap.set(list, { x: 0 });

		animationRef.current = gsap.to(list, {
			x: `-${width}px`,
			duration: 40,
			repeat: -1,
			ease: "linear",
			modifiers: {
				x: gsap.utils.unitize((x) => parseFloat(x) % width),
			},
		});

		return () => {
			if (animationRef.current) animationRef.current.kill();
		};
	}, [repeatedCoupons]);

	if (!couponsData || couponsData.length === 0) {
		return null;
	}

	return (
		<div className="w-full overflow-hidden bg-black bg-opacity-20">
			<div ref={containerRef} className="w-full relative" onMouseEnter={() => animationRef.current?.pause()} onMouseLeave={() => animationRef.current?.play()}>
				<div className="flex whitespace-nowrap w-full py-2">
					{[...repeatedCoupons, ...repeatedCoupons].map((coupon, index) => (
						<div key={index} className="px-4 py-[2px] bg-white bg-opacity-10 text-white text-xs md:text-sm font-medium rounded-lg shadow-md flex items-center justify-center mx-2 flex-shrink-0">
							{coupon.scrollingText} - <span className="ml-1 font-semibold text-white">{coupon.code}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ScrollingCoupons;
