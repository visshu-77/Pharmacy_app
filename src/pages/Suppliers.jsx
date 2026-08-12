import { useEffect, useState } from "react"

import {
   getSuppliers,
   createSupplier,
   updateSupplier,
   deleteSupplier
} from "../services/supplierService"

export default function Suppliers() {

   const [suppliers, setSuppliers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [showModal, setShowModal] = useState(false);
   const [editingSupplier, setEditingSupplier] = useState(null);
   const [formData, setFormaData] = useState({
      supplierName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      gstNumber: ""
   })

   useEffect(() => {
      fetchSuppliers();
   }, []);

   const fetchSuppliers = async () => {
      try {
         setLoading(true);
         const data = await getSuppliers();
         setSuppliers(data.suppliers || []);

      } catch (err) {
         console.log(err);
         setError(err?.response?.data?.message || "Something went wrong");
      } finally {
         setLoading(false);
      }
   }

   const handleSupplierChange = (e) => {
      const { name, value } = e.target;

      setFormaData((prev) => ({
         ...prev,
         [name]: value
      }));
   };

   const handleCreateSupplier = async (e) => {
      e.preventDefault();
      try {
         setError("");
         const data = await createSupplier(formData);
         console.log("Supplier created:", data);
         // Refresh supplier list
         await fetchSuppliers();
         // Clse modal
         setShowModal(false);
         // Reset form
         setFormaData({
            supplierName: "",
            phone: "",
            email: "",
            address: "",
            city: "",
            state: "",
            gstNumber: ""
         });

      } catch (error) {
         console.log("Create supplier error:", error);
         setError(
            error?.response?.data?.message ||
            "Failed to create supplier"
         );
      }
   };

   return (
      <>
         <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
               <h2 className="text-lg font-semibold text-gray-900">
                  Suppliers
               </h2>
               <p className="text-sm text-gray-500 mt-1">
                  Manage your suppliers and their information.
               </p>
            </div>

            <button
               onClick={() => {
                  setEditingSupplier(null);
                  setShowModal(true);
               }}
               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
               + Add Supplier
            </button>
            {showModal && (

               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                  <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl">

                     {/* Header */}

                     <div className="flex items-center justify-between px-6 py-4 border-b">

                        <div>
                           <h2 className="text-lg font-semibold text-gray-900">
                              Add Supplier
                           </h2>

                           <p className="text-sm text-gray-500 mt-1">
                              Add a new supplier to your shop.
                           </p>
                        </div>

                        <button
                           type="button"
                           onClick={() => setShowModal(false)}
                           className="text-gray-500 hover:text-gray-800 text-xl"
                        >
                           ×
                        </button>

                     </div>


                     {/* Form */}

                     <form
                        onSubmit={handleCreateSupplier}
                        className="p-6"
                     >

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                           {/* Supplier Name */}

                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                 Supplier Name
                              </label>

                              <input
                                 type="text"
                                 name="supplierName"
                                 value={formData.supplierName}
                                 onChange={handleSupplierChange}
                                 required
                                 placeholder="Enter supplier name"
                                 className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                              />
                           </div>


                           {/* Phone */}

                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                 Phone
                              </label>

                              <input
                                 type="text"
                                 name="phone"
                                 value={formData.phone}
                                 onChange={handleSupplierChange}
                                 placeholder="Enter phone number"
                                 className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                              />
                           </div>


                           {/* Email */}

                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                 Email
                              </label>

                              <input
                                 type="email"
                                 name="email"
                                 value={formData.email}
                                 onChange={handleSupplierChange}
                                 placeholder="Enter email"
                                 className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                              />
                           </div>


                           {/* GST */}

                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                 GST Number
                              </label>

                              <input
                                 type="text"
                                 name="gstNumber"
                                 value={formData.gstNumber}
                                 onChange={handleSupplierChange}
                                 placeholder="Enter GST number"
                                 className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                              />
                           </div>


                           {/* City */}

                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                 City
                              </label>

                              <input
                                 type="text"
                                 name="city"
                                 value={formData.city}
                                 onChange={handleSupplierChange}
                                 placeholder="Enter city"
                                 className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                              />
                           </div>


                           {/* State */}

                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                 State
                              </label>

                              <input
                                 type="text"
                                 name="state"
                                 value={formData.state}
                                 onChange={handleSupplierChange}
                                 placeholder="Enter state"
                                 className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                              />
                           </div>


                           {/* Address */}

                           <div className="md:col-span-2">

                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                 Address
                              </label>

                              <textarea
                                 name="address"
                                 value={formData.address}
                                 onChange={handleSupplierChange}
                                 rows="3"
                                 placeholder="Enter supplier address"
                                 className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              />

                           </div>

                        </div>


                        {/* Buttons */}

                        <div className="flex justify-end gap-3 mt-6 pt-5 border-t">

                           <button
                              type="button"
                              onClick={() => setShowModal(false)}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                           >
                              Cancel
                           </button>

                           <button
                              type="submit"
                              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                           >
                              Add Supplier
                           </button>

                        </div>

                     </form>

                  </div>

               </div>

            )}
            {loading ? (
               <div className="px-5 py-10 text-center text-gray-500">
                  Loading suppliers...
               </div>
            ) : error ? (
               <div className="px-5 py-10 text-center text-red-500">
                  {error}
               </div>
            ) : suppliers.length === 0 ? (
               <div className="px-5 py-10 text-center text-gray-500">
                  No suppliers found.
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="bg-gray-50">
                        <tr>
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
                     <tbody>
                        {suppliers.map((supplier) => (
                           <tr
                              key={supplier._id}
                              className="border-t border-gray-100 hover:bg-gray-50"
                           >
                              <td className="px-5 py-4 text-sm font-medium text-gray-900">
                                 {supplier.supplierName}
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-700">
                                 {supplier.phone || "-"}
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-700">
                                 {supplier.email || "-"}
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-700">
                                 {supplier.city || "-"}
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-700">
                                 {supplier.gstNumber || "-"}
                              </td>
                              <td className="px-5 py-4">
                                 <div className="flex gap-2">
                                    <button
                                       className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                       Edit
                                    </button>
                                    <button
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
            )}
         </div>
      </>
   )
}