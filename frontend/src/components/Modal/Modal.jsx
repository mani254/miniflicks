import React from "react";
import ReactDOM from "react-dom";
import { useModalStore } from "../../store/modalStore";

const Modal = () => {
	const { isOpen, props, component: Component } = useModalStore();
	const modalRoot = document.getElementById("modal-root");

	if (!isOpen || !Component || !modalRoot) return null;

	return ReactDOM.createPortal(
		<section className="modal-section w-full h-screen fixed top-0 left-0 bg-dark bg-opacity-10 flex items-center justify-center z-50">
			{React.createElement(Component, props)}
		</section>,
		modalRoot
	);
};

export default Modal;
