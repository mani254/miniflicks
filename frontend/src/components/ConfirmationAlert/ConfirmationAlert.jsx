import React from "react";
import CloseModelBtn from "../Modal/CloseModelBtn";
import { hideModal } from "../../store/modalStore";

function ConfirmationAlert({ title, info, confirmFunction, id }) {
	return (
		<div className="card bg-white p-6 rounded-lg w-full max-w-xs relative">
			<div className="">
				<p className="text-lg font-medium mb-2">{title}</p>
				<p className="text-xs mb-5">{info}</p>
			</div>
			<div className="flex w-full justify-between">
				<button className="rounded-md bg-logo px-4 py-1 text-white" onClick={() => hideModal()}>
					Cancel
				</button>
				<button
					className="rounded-md bg-gray-400 px-4 py-1 text-white"
					onClick={() => {
						confirmFunction(id);
						hideModal();
					}}>
					Delete
				</button>
			</div>
			<CloseModelBtn className="absolute top-3 right-4" />
		</div>
	);
}

export default ConfirmationAlert;
