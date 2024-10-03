import React from "react";
import { IoSearchSharp } from "react-icons/io5";

function SearchComponent() {
	return (
		<div className="relative w-full max-w-[300px]">
			<div className="absolute top-1/2 right-5 -translate-y-1/2 opacity-40">
				<IoSearchSharp />
			</div>
			<input className="bg-zinc-100 rounded-md  px-3 w-full outline-none border border-black border-opacity-20" placeholder="Search Anything here" />
		</div>
	);
}

export default SearchComponent;
