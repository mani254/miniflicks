import React, { useEffect, useRef } from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import { gsap } from "gsap";

const SmoothScroll = ({ children }) => {
	const lenisRef = useRef();

	useEffect(() => {
		function update(time) {
			lenisRef.current?.lenis?.raf(time * 1000);
		}

		gsap.ticker.add(update);

		return () => {
			gsap.ticker.remove(update);
		};
	}, []);

	return (
		<ReactLenis root ref={lenisRef} autoRaf={false}>
			{children}
		</ReactLenis>
	);
};

export default SmoothScroll;
