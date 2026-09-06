import React, { useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "../ui/button.jsx";

const Pagination = ({ noOfDocuments, limit = 10, currentPage, setCurrentPage, params, setParams }) => {
  const totalPages = Math.ceil(noOfDocuments / limit);

  useEffect(() => {
    if (!setParams) return;
    const newParams = new URLSearchParams(params);
    newParams.set("page", currentPage);
    newParams.set("limit", limit);
    setParams(newParams);
  }, [currentPage, limit, params, setParams]);

  if (totalPages <= 1) return null;

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
    <div className="flex items-center justify-between px-2 py-4 border-t border-gray-100 mt-2">
      <div className="text-xs text-gray-500">
        Showing{" "}
        <span className="font-semibold text-gray-800">
          {(currentPage - 1) * limit + 1}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-gray-800">
          {Math.min(currentPage * limit, noOfDocuments)}
        </span>{" "}
        of <span className="font-semibold text-gray-800">{noOfDocuments}</span> results
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-gray-600 hover:text-gray-900 disabled:opacity-30"
          onClick={handlePrevPages10}
          disabled={currentPage <= 10}
          title="Jump backward 10 pages"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-gray-600 hover:text-gray-900 disabled:opacity-30"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="text-xs font-medium text-gray-700 px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-gray-600 hover:text-gray-900 disabled:opacity-30"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-gray-600 hover:text-gray-900 disabled:opacity-30"
          onClick={handleNextPages10}
          disabled={currentPage + 10 > totalPages}
          title="Jump forward 10 pages"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
