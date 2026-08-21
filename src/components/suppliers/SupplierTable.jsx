export default function SupplierTable({
   suppliers,
   selectedSuppliers,
   onSelectSupplier,
   onSelectAll,
   onEdit,
   onDelete
}) {
   const allSelected =
      suppliers.length > 0 &&
      suppliers.every((supplier) =>
         selectedSuppliers.includes(supplier._id)
      );

   return (
      <div className="overflow-x-auto">

         <table className="w-full">

            {/* Header */}
            <thead className="bg-gray-50">

               <tr>

                  {/* Select All */}
                  <th>
                     <input
                        type="checkbox"
                        className="ml-2"
                        checked={allSelected}
                        onChange={(e) =>
                           onSelectAll(e.target.checked)
                        }
                     />
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                     Supplier
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                     Phone
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                     Email
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                     Location
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                     GST
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                     Actions
                  </th>

               </tr>

            </thead>

            {/* Body */}
            <tbody>

               {suppliers.map((supplier) => (

                  <tr
                     key={supplier._id}
                     className="border-t border-gray-100 hover:bg-gray-50"
                  >

                     {/* Checkbox */}
                     <td>

                        <input
                           type="checkbox"
                           className="ml-4"
                           checked={selectedSuppliers.includes(
                              supplier._id
                           )}
                           onChange={(e) =>
                              onSelectSupplier(
                                 supplier._id,
                                 e.target.checked
                              )
                           }
                        />

                     </td>

                     {/* Supplier */}
                     <td className="px-5 py-4 text-sm font-medium text-gray-900">
                        {supplier.supplierName}
                     </td>

                     {/* Phone */}
                     <td className="px-5 py-4 text-sm text-gray-700">
                        {supplier.phone || "-"}
                     </td>

                     {/* Email */}
                     <td className="px-5 py-4 text-sm text-gray-700">
                        {supplier.email || "-"}
                     </td>

                     {/* Location */}
                     <td className="px-5 py-4 text-sm text-gray-700">
                        {supplier.city || "-"}
                     </td>

                     {/* GST */}
                     <td className="px-5 py-4 text-sm text-gray-700">
                        {supplier.gstNumber || "-"}
                     </td>

                     {/* Actions */}
                     <td className="px-5 py-4">

                        <div className="flex gap-2">

                           <button
                              type="button"
                              onClick={() => onEdit(supplier)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                           >
                              Edit
                           </button>

                           <button
                              type="button"
                              onClick={() => onDelete(supplier)}
                              className="text-red-600 hover:text-red-800 text-sm"
                           >
                              Delete
                           </button>

                        </div>

                     </td>

                  </tr>

               ))}

            </tbody>

         </table>

      </div>
   );
}
