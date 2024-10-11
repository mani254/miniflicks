import React, { useState, useEffect } from "react";
import { IoSearchSharp } from "react-icons/io5";

function SearchComponent({ debounce = 0, searchFunction, params = false, setParams }) {
	const [searchValue, setSearchValue] = useState("");
	const [timer, setTimer] = useState(null);
	const inputRef = React.useRef(null);

	function handleSearchInputChange(e) {
		const value = e.target.value;
		setSearchValue(value);

		if (debounce > 0) {
			if (timer) clearTimeout(timer);
			setTimer(
				setTimeout(() => {
					handleSearch(value);
				}, debounce)
			);
		}
	}

	function handleBlur() {
		handleSearch(searchValue);
	}

	function handleSearch(value) {
		if (params) {
			const newParams = new URLSearchParams(params);
			if (value) {
				newParams.set("search", value);
			} else {
				newParams.delete("search");
			}
			setParams(newParams);
		} else {
			searchFunction(value);
		}
	}

	function handleKeyDown(e) {
		if (e.key === "Enter") {
			inputRef.current.blur();
			if (timer) clearTimeout(timer);
		}
	}

	useEffect(() => {
		if (params && params.get("search")) {
			setSearchValue(params.get("search"));
		}
	}, []);

	useEffect(() => {
		return () => {
			if (timer) clearTimeout(timer);
		};
	}, [timer]);

	return (
		<div className="relative w-full max-w-[300px] input-wrapper">
			<div className="absolute top-1/2 right-5 -translate-y-1/2 opacity-40">
				<IoSearchSharp />
			</div>
			<input ref={inputRef} className="" value={searchValue} placeholder="Search Here" onChange={handleSearchInputChange} onBlur={handleBlur} onKeyDown={handleKeyDown} />
		</div>
	);
}

export default SearchComponent;
