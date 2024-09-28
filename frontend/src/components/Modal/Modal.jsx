import React, { useEffect } from "react";
import ReactDOM from "react-dom";

const Modal = ({ props, component }) => {
	const modalRoot = document.getElementById("modal-root");
	const el = document.createElement("div");

	useEffect(() => {
		modalRoot.appendChild(el);
		return () => {
			modalRoot.removeChild(el);
		};
	}, [el, modalRoot]);

	return ReactDOM.createPortal(<section className="modal-section w-full h-screen fixed top-0 left-0 bg-white bg-opacity-20 flex items-center justify-center z-50 backdrop-blur-xl">{component && React.createElement(component, props)}</section>, el);
};

export default Modal;
