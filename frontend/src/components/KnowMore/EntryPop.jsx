import React, { useRef, useEffect, useState } from "react";
import CloseModelBtn from "../Modal/CloseModelBtn";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modal/modalActions";

import offer from "../../assets/popup/offer-banner.jpg";

function EntryPop({ hideModal }) {
	const [visible, setVisible] = useState(false);
	const modalRef = useRef(null);

	useEffect(() => setVisible(true), []);

	function handleClickOutside(event) {
		if (modalRef.current && !modalRef.current.contains(event.target)) {
			hideModal();
		}
	}

	return (
		<div className="w-full h-screen relative flex justify-center items-center" onClick={handleClickOutside}>
			<div ref={modalRef} className={`card bg-white p-6 rounded-lg w-full max-w-xs absolute transition-all duration-500 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}>
				<div>
					<img src={offer} alt="offer image" />
				</div>
				<CloseModelBtn className="absolute top-3 right-4" />
			</div>
		</div>
	);
}

const mapDispatchToProps = (dispatch) => {
	return {
		hideModal: () => dispatch(hideModal()),
	};
};

export default connect(null, mapDispatchToProps)(EntryPop);
