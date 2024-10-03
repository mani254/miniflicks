import React from "react";

function Switch({ status, changeHandler = null, id }) {
	return (
		<div className="flex items-center">
			<label className="relative inline-flex items-center cursor-pointer">
				<input type="checkbox" className="sr-only peer" checked={status} onChange={() => changeHandler(id)} disabled={!changeHandler} />
				<div className={`group peer rounded-full duration-300 w-9 h-4 ring-2  after:duration-300 after:bg-gray-500 bg-gray-200 ring-gray-400 peer-checked:bg-green-200 peer-checked:after:bg-green-500 peer-checked:ring-green-300 after:rounded-full after:absolute after:h-3 after:w-3 after:top-[2px] after:left-[2px] after:flex after:justify-center after:items-center peer-checked:after:translate-x-5 peer-hover:after:scale-95`}></div>
			</label>
		</div>
	);
}

export default Switch;
