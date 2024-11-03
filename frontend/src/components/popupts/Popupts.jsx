import React, { useRef, useEffect, useState } from "react";
import CloseModelBtn from "../Modal/CloseModelBtn";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modal/modalActions";

function Popupts({ title, array, hideModal }) {
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
				<h3 className="text-center">{title}</h3>

				<div className="max-h-[500px] overflow-y-scroll custom-scrollbar">
					{array.length && (
						<div>
							{array.map((item, index) => {
								return (
									<div key={index} className="mt-2">
										<h5>{item.title}</h5>
										<p className="text-xs">{item.description}</p>
									</div>
								);
							})}
						</div>
					)}
				</div>

				<CloseModelBtn className="absolute top-3 right-4" onClick={hideModal} />
			</div>
		</div>
	);
}

const mapDispatchToProps = (dispatch) => ({
	hideModal: () => dispatch(hideModal()),
});

export default connect(null, mapDispatchToProps)(Popupts);
