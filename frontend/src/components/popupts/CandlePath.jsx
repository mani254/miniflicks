import React, { useRef, useEffect, useState } from "react";
import CloseModelBtn from "../Modal/CloseModelBtn";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modal/modalActions";
import Ripple from "../Loader/Ripple";

import canldePathVideo from "../../assets/gallery/rose-path/video-1.mp4";

function smokeEntry({ hideModal }) {
	const [visible, setVisible] = useState(false);
	const [videoLoading, setVideoLoading] = useState(true);
	const modalRef = useRef(null);

	useEffect(() => {
		setVisible(true);
		document.addEventListener("mousedown", handleClickOutside);

		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	function handleClickOutside(event) {
		if (modalRef.current && !modalRef.current.contains(event.target)) {
			hideModal();
		}
	}

	return (
		<div className="w-full h-screen relative flex justify-center items-center mx-4" onClick={handleClickOutside}>
			<div ref={modalRef} className={`card bg-white px-3 py-5 rounded-lg w-full max-w-[500px] absolute transition-all duration-500 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}>
				<h3 className="text-center">Candle Path</h3>

				<div className="relative w-full max-w-[250px] aspect-[9/16] bg-gray-300 rounded-2xl overflow-hidden flex items-center justify-center mt-3 mx-auto">
					{videoLoading && (
						<div className="absolute inset-0 flex items-center justify-center">
							<Ripple />
						</div>
					)}
					<video className="absolute w-full h-full object-cover" src={canldePathVideo} controls muted autoPlay loop playsInline onCanPlay={() => setVideoLoading(false)} loading="lazy" />
				</div>

				<CloseModelBtn className="absolute top-3 right-4" onClick={hideModal} />
			</div>
		</div>
	);
}

const mapDispatchToProps = (dispatch) => ({
	hideModal: () => dispatch(hideModal()),
});

export default connect(null, mapDispatchToProps)(smokeEntry);
