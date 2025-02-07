import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { connect } from "react-redux";
import { getUserCoupons } from "../redux/coupon/couponActions";

const ScrollingCoupons = ({ getUserCoupons, couponsData }) => {
	const containerRef = useRef(null);
	const animationRef = useRef(null);
	const [repeatedCoupons, setRepeatedCoupons] = useState([]);

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
		sampleCoupon.innerText = couponsData[0].scrollingText + " - " + couponsData[0].code;
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
		(async () => {
			try {
				await getUserCoupons();
			} catch (err) {
				console.log(err);
			}
		})();
	}, []);

	useEffect(() => {
		calculateCoupons();
		window.addEventListener("resize", calculateCoupons);
		return () => window.removeEventListener("resize", calculateCoupons);
	}, [couponsData]);

	useEffect(() => {
		if (repeatedCoupons.length === 0) return;

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
	}, [repeatedCoupons]);

	return (
		<>
			{couponsData.length > 0 && (
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
			)}
		</>
	);
};

const mapStateToProps = (state) => {
	return {
		couponsData: state.coupons.coupons,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getUserCoupons: () => dispatch(getUserCoupons()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ScrollingCoupons);
