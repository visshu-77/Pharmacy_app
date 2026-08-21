export default function ImportSupplierModal({
   show,
   importData,
   importLoading,
   importProgress,
   importSuccess,
   onConfirm,
   onCancel,
   onDone
}) {
   if (!show) return null;

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

         <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">

            {importLoading ? (

               /* =========================
                  IMPORTING
               ========================= */

               <div className="text-center">

                  <div className="mx-auto w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">

                     <svg
                        className="w-7 h-7 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth="2"
                           d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                        />
                     </svg>

                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mt-4">
                     Importing Suppliers
                  </h3>

                  <div className="mt-6">

                     <div className="flex justify-between text-sm mb-2">

                        <span className="text-gray-600">
                           Importing suppliers...
                        </span>

                        <span className="font-semibold text-gray-900">
                           {importProgress}%
                        </span>

                     </div>

                     <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">

                        <div
                           className="h-full bg-blue-600 rounded-full transition-all duration-500"
                           style={{
                              width: `${importProgress}%`
                           }}
                        />

                     </div>

                     <p className="text-xs text-gray-500 text-center mt-3">
                        Please wait while suppliers are being imported.
                     </p>

                  </div>

               </div>

            ) : importSuccess ? (

               /* =========================
                  SUCCESS
               ========================= */

               <div className="text-center">

                  <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">

                     <svg
                        className="w-9 h-9 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth="2"
                           d="M5 13l4 4L19 7"
                        />
                     </svg>

                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mt-4">
                     Import Successful
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                     {importData.length} suppliers imported successfully.
                  </p>

                  <button
                     type="button"
                     onClick={onDone}
                     className="mt-5 w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                     Done
                  </button>

               </div>

            ) : (

               /* =========================
                  CONFIRMATION
               ========================= */

               <>

                  <div className="mx-auto w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">

                     <svg
                        className="w-7 h-7 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth="2"
                           d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                        />
                     </svg>

                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 text-center mt-4">
                     Import Suppliers?
                  </h3>

                  <p className="text-sm text-gray-500 text-center mt-2">
                     You are about to import{" "}
                     <span className="font-semibold text-gray-900">
                        {importData.length}
                     </span>{" "}
                     suppliers from the selected CSV file.
                  </p>

                  <p className="text-sm text-gray-500 text-center mt-1">
                     Do you want to continue?
                  </p>

                  <div className="flex gap-3 mt-6">

                     <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                     >
                        Cancel
                     </button>

                     <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                     >
                        Confirm Import
                     </button>

                  </div>

               </>

            )}

         </div>

      </div>
   );
}
