import React, { useRef, useEffect, useState } from "react";
import CloseModelBtn from "../Modal/CloseModelBtn";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modal/modalActions";

import roseOnTable from "../../assets/gallery/rose-path/image-9.webp";

function RoseTable({ hideModal }) {
	const [visible, setVisible] = useState(false);
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
				<h3 className="text-center">Rose On Table</h3>

				<div className="w-[300px] h-[300px] mx-auto mt-5 relative rounded-xl overflow-hidden">
					<img src={roseOnTable} alt="rose on table miniflicks private theatre" className="w-full h-full object-cover object-center absolute" />
				</div>

				<CloseModelBtn className="absolute top-3 right-4" onClick={hideModal} />
			</div>
		</div>
	);
}

const mapDispatchToProps = (dispatch) => ({
	hideModal: () => dispatch(hideModal()),
});

export default connect(null, mapDispatchToProps)(RoseTable);
