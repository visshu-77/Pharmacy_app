export default function DeleteSupplierModal({
   show,
   selectedCount,
   loading,
   onCancel,
   onConfirm
}) {
   if (!show) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

         <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">

            {/* Icon */}
            <div className="flex justify-center mb-4">

               <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">

                  <span className="text-red-600 text-xl">
                     !
                  </span>

               </div>

            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-900 text-center">
               Delete Selected Suppliers?
            </h2>

            {/* Message */}
            <p className="text-sm text-gray-500 text-center mt-2">

               Are you sure you want to delete{" "}

               <span className="font-semibold text-gray-800">
                  {selectedCount}
               </span>{" "}

               selected supplier
               {selectedCount > 1 ? "s" : ""}?

            </p>

            {/* Buttons */}
            <div className="flex justify-center gap-3 mt-6">

               {/* Cancel */}
               <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
               >
                  Cancel
               </button>

               {/* Confirm */}
               <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
               >
                  {loading ? "Deleting..." : "Delete"}
               </button>

            </div>

         </div>

      </div>
   );
}
