export default function SupplierPagination({
   currentPage,
   totalPages,
   totalItems,
   itemsPerPage,
   onPageChange
}) {
   if (totalPages <= 1) {
      return null;
   }

   const indexOfFirstItem =
      (currentPage - 1) * itemsPerPage;

   const indexOfLastItem =
      Math.min(
         currentPage * itemsPerPage,
         totalItems
      );

   return (
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200">

         {/* Showing information */}
         <div className="text-sm text-gray-500">

            Showing{" "}

            <span className="font-medium text-gray-700">
               {indexOfFirstItem + 1}
            </span>

            {" - "}

            <span className="font-medium text-gray-700">
               {indexOfLastItem}
            </span>

            {" of "}

            <span className="font-medium text-gray-700">
               {totalItems}
            </span>

            {" suppliers"}

         </div>

         {/* Pagination */}
         <div className="flex items-center gap-2">

            {/* Previous */}
            <button
               type="button"
               onClick={() =>
                  onPageChange(
                     Math.max(currentPage - 1, 1)
                  )
               }
               disabled={currentPage === 1}
               className="
                  px-3 py-2 text-sm
                  border border-gray-300
                  rounded-lg
                  hover:bg-gray-50
                  disabled:opacity-40
                  disabled:cursor-not-allowed
               "
            >
               Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">

               {/* First page */}
               <button
                  type="button"
                  onClick={() => onPageChange(1)}
                  className={`
                     w-9 h-9 text-sm rounded-lg border
                     ${
                        currentPage === 1
                           ? "bg-blue-600 text-white border-blue-600"
                           : "border-gray-300 text-gray-700 hover:bg-gray-50"
                     }
                  `}
               >
                  1
               </button>

               {/* Left dots */}
               {currentPage > 4 && (
                  <span className="px-2 text-gray-500">
                     ...
                  </span>
               )}

               {/* Middle pages */}
               {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
               )
                  .filter((page) => {

                     if (
                        page === 1 ||
                        page === totalPages
                     ) {
                        return false;
                     }

                     return (
                        page >= currentPage - 2 &&
                        page <= currentPage + 2
                     );
                  })
                  .map((page) => (

                     <button
                        key={page}
                        type="button"
                        onClick={() =>
                           onPageChange(page)
                        }
                        className={`
                           w-9 h-9 text-sm rounded-lg border
                           ${
                              currentPage === page
                                 ? "bg-blue-600 text-white border-blue-600"
                                 : "border-gray-300 text-gray-700 hover:bg-gray-50"
                           }
                        `}
                     >
                        {page}
                     </button>

                  ))}

               {/* Right dots */}
               {currentPage < totalPages - 3 && (
                  <span className="px-2 text-gray-500">
                     ...
                  </span>
               )}

               {/* Last page */}
               {totalPages > 1 && (
                  <button
                     type="button"
                     onClick={() =>
                        onPageChange(totalPages)
                     }
                     className={`
                        w-9 h-9 text-sm rounded-lg border
                        ${
                           currentPage === totalPages
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }
                     `}
                  >
                     {totalPages}
                  </button>
               )}

            </div>

            {/* Next */}
            <button
               type="button"
               onClick={() =>
                  onPageChange(
                     Math.min(
                        currentPage + 1,
                        totalPages
                     )
                  )
               }
               disabled={currentPage === totalPages}
               className="
                  px-3 py-2 text-sm
                  border border-gray-300
                  rounded-lg
                  hover:bg-gray-50
                  disabled:opacity-40
                  disabled:cursor-not-allowed
               "
            >
               Next
            </button>

         </div>

      </div>
   );
}
