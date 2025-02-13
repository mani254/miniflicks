import React, { useEffect } from "react";
import { FaAngleLeft, FaAngleRight, FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";

const Pagination = ({ noOfDocuments, limit, currentPage, setCurrentPage, params, setParams }) => {
	const totalPages = Math.ceil(noOfDocuments / limit);

	// console.log(totalPages, currentPage, limit);

	useEffect(() => {
		const newParams = new URLSearchParams(params);
		newParams.set("page", currentPage);
		newParams.set("limit", limit);
		setParams(newParams);
	}, [currentPage]);

	// useEffect(() => {
	// 	if (params && params.get("page")) {
	// 		setCurrentPage(params.get("page"));
	// 	}
	// }, []);

	const handleNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handlePrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleNextPages10 = () => {
		const newPage = Math.min(currentPage + 10, totalPages);
		setCurrentPage(newPage);
	};

	const handlePrevPages10 = () => {
		const newPage = Math.max(currentPage - 10, 1);
		setCurrentPage(newPage);
	};

	return (
		<>
			{totalPages > 1 && (
				<div className="mt-5 flex items-center justify-center">
					<div className="flex gap-3">
						<button onClick={handlePrevPages10} disabled={currentPage <= 10} className="bg-white border border-gray-400 border-opacity-30 shadow-sm px-2 py-1 rounded-md">
							<FaAnglesLeft />
						</button>
						<button onClick={handlePrevPage} disabled={currentPage === 1} className="bg-white border border-gray-400 border-opacity-30 shadow-sm px-2 py-1 rounded-md">
							<FaAngleLeft />
						</button>
						<p className="mx-2">
							Page {currentPage} of {totalPages}
						</p>
						<button onClick={handleNextPage} disabled={currentPage === totalPages} className="bg-white border border-gray-400 border-opacity-30 shadow-sm px-2 py-1 rounded-md">
							<FaAngleRight />
						</button>
						<button onClick={handleNextPages10} disabled={currentPage + 10 > totalPages} className="bg-white border border-gray-400 border-opacity-30 shadow-sm px-2 py-1 rounded-md">
							<FaAnglesRight />
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default Pagination;
