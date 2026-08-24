export default function SupplierModal({
   show,
   editingSupplier,
   formData,
   onChange,
   onSubmit,
   onClose,
   error,
   loading
}) {
   if (!show) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
         <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl">

            <div className="flex items-center justify-between px-6 py-4 border-b">
               <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                     {editingSupplier ? "Edit Supplier" : "Add Supplier"}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                     {editingSupplier
                        ? "Update supplier information."
                        : "Add a new supplier to your shop."}
                  </p>
               </div>

               <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-800 text-xl"
               >
                  ×
               </button>
            </div>

            <form onSubmit={onSubmit} className="p-6">

               {error && (
                  <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                     <svg
                        className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth="2"
                           d="M12 9v4m0 4h.01M10.29 3.86l-7.82 13a2 2 0 001.71 2.64h15.64a2 2 0 001.71-2.64l-7.82-13a2 2 0 00-3.42 0z"
                        />
                     </svg>

                     <p className="text-sm text-red-600">
                        {error}
                     </p>

                  </div>
               )}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Supplier Name <span className="text-red-500">*</span>
                     </label>

                     <input
                        type="text"
                        name="supplierName"
                        value={formData.supplierName}
                        onChange={onChange}
                        placeholder="Supplier Name"
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                     </label>

                      <input
                        type="number"
                        name="phone"
                        value={formData.phone}
                        onChange={onChange}
                        placeholder="Phone number"
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email 
                     </label>

                     <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={onChange}
                        placeholder="email"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST Number
                     </label>

                     <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={onChange}
                        placeholder="GST Number"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                     </label>

                     <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={onChange}
                        placeholder="City"
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                     </label>

                     <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={onChange}
                        placeholder="State"
                        required 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                     />
                  </div>

                  <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address <span className="text-red-500">*</span>
                     </label>

                     <textarea
                        name="address"
                        value={formData.address}
                        onChange={onChange}
                        rows="3"
                        placeholder="Address"
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 resize-none"
                     />
                  </div>

               </div>

               <div className="flex justify-end gap-3 mt-6 pt-5 border-t">
                  <button
                     type="button"
                     onClick={onClose}
                     className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                     Cancel
                  </button>

                  <button
                     type="submit"
                     disabled={loading}
                     className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     {loading
                        ? "Saving..."
                        : editingSupplier
                           ? "Update Supplier"
                           : "Add Supplier"}
                  </button>
               </div>

            </form>


         </div>
      </div>
   );
}
