import { useEffect, useState } from "react";
import Papa from "papaparse";
import axios from "axios";
import LastParams from "../components/lastParams";

import {
   getSuppliers,
   createSupplier,
   updateSupplier,
   deleteSupplier,
   deleteSelectedSuppliers,
   deleteAllSuppliers
} from "../services/supplierService"

export default function Suppliers() {

   const [suppliers, setSuppliers] = useState([]);
   const [selectedSuppliers, setSelectedSuppliers] = useState([]);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const [deleteLoading, setDeleteLoading] = useState(false);

   const [currentPage, setCurrentPage] = useState(1);
   const suppliersPerPage = 10;

   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   const [showModal, setShowModal] = useState(false);
   const [editingSupplier, setEditingSupplier] = useState(null);
   const [supplierSearch, setSupplierSearch] = useState("");
   const [importFile, setImportFile] = useState(null);
   const [importData, setImportData] = useState([]);
   const [showImportConfirm, setShowImportConfirm] = useState(false);
   const [importProgress, setImportProgress] = useState(0);
   const [importSuccess, setImportSuccess] = useState(false);
   const [importLoading, setImportLoading] = useState(false);
   const [formData, setFormaData] = useState({
      supplierName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      gstNumber: ""
   });

   const handleEditSupplier = (supplier) => {

      setEditingSupplier(supplier);

      setFormaData({
         supplierName: supplier.supplierName || "",
         phone: supplier.phone || "",
         email: supplier.email || "",
         address: supplier.address || "",
         city: supplier.city || "",
         state: supplier.state || "",
         gstNumber: supplier.gstNumber || ""
      });

      setShowModal(true);
   };

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
         if (editingSupplier) {
            const data = await updateSupplier(
               editingSupplier._id,
               formData
            );
            console.log("Supplier updated:", data);
         } else {
            const data = await createSupplier(formData);
            console.log("Supplier created:", data);
         }
         await fetchSuppliers();
         setShowModal(false);
         setEditingSupplier(null);
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
         console.log("Supplier save error:", error);
         setError(
            error?.response?.data?.message ||
            "Failed to save supplier"
         );
      }
   };

   const handleDeleteSupplier = async (supplier) => {
      const confirmed = window.confirm(
         `Are you sure you want to delete "${supplier.supplierName}"?`
      );
      if (!confirmed) {
         return;
      }
      try {
         setError("");
         await deleteSupplier(supplier._id);
         await fetchSuppliers();
      } catch (error) {
         console.log("Delete supplier error:", error);
         setError(
            error?.response?.data?.message ||
            "Failed to delete supplier"
         );
      }
   };

   const filteredSuppliers = suppliers.filter((supplier) => {
      const search = supplierSearch.toLowerCase().trim();
      if (!search) {
         return true;
      }
      return (
         supplier.supplierName?.toLowerCase().includes(search) ||
         supplier.phone?.toString().includes(search) ||
         supplier.email?.toLowerCase().includes(search) ||
         supplier.city?.toLowerCase().includes(search) ||
         supplier.state?.toLowerCase().includes(search) ||
         supplier.gstNumber?.toLowerCase().includes(search)
      );
   });

   const exportSuppliersCSV = () => {
      if (!suppliers || suppliers.length === 0) {
         alert("No suppliers available to export.");
         return;
      }
      const headers = [
         "Supplier Name",
         "Phone",
         "Email",
         "Address",
         "City",
         "State",
         "GST Number"
      ];
      const rows = suppliers.map((supplier) => [
         supplier.supplierName || "",
         supplier.phone || "",
         supplier.email || "",
         supplier.address || "",
         supplier.city || "",
         supplier.state || "",
         supplier.gstNumber || ""
      ]);
      const csvContent = [
         headers,
         ...rows
      ]
         .map((row) =>
            row
               .map((value) => `"${String(value).replace(/"/g, '""')}"`)
               .join(",")
         )
         .join("\n");

      const blob = new Blob(
         [csvContent],
         {
            type: "text/csv;charset=utf-8;"
         }
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `suppliers_${new Date()
         .toISOString()
         .slice(0, 10)}.csv`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);
   };

   useEffect(() => {
      console.log("Import file state:", importFile);
   }, [importFile]);

   const handleSupplierCSVSelect = (e) => {
      const file = e.target.files[0];

      if (!file) return;

      if (!file.name.toLowerCase().endsWith(".csv")) {
         alert("Please select a CSV file.");
         e.target.value = "";
         return;
      }

      setImportFile(file);

      Papa.parse(file, {
         header: true,
         skipEmptyLines: true,

         complete: (results) => {

            console.log("CSV headers:", results.meta.fields);
            console.log("CSV rows:", results.data);

            const formattedSuppliers = results.data.map((row) => ({
               supplierName: row["Supplier Name"]?.trim() || "",
               phone: row["Phone"]?.trim() || "",
               email: row["Email"]?.trim() || "",
               address: row["Address"]?.trim() || "",
               city: row["City"]?.trim() || "",
               state: row["State"]?.trim() || "",
               gstNumber: row["GST Number"]?.trim() || ""
            }));

            console.log(
               "Formatted suppliers:",
               formattedSuppliers
            );

            setImportData(formattedSuppliers);

            // Open confirmation popup
            setShowImportConfirm(true);
         },

         error: (error) => {
            console.error("CSV parsing error:", error);
            alert("Failed to read CSV file.");
         }
      });
   };

   // import function
   const handleImportSuppliers = async () => {

      if (!importData.length) {
         alert("Please select a CSV file first.");
         return;
      }

      try {

         setImportLoading(true);
         setImportProgress(0);
         setImportSuccess(false);

         // Start progress
         setImportProgress(10);

         const response = await axios.post(
            "http://localhost:5000/supplier/import",
            {
               suppliers: importData
            },
            {
               headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/json"
               }
            }
         );

         // API successfully completed
         setImportProgress(100);

         // Show success state
         setImportSuccess(true);

         console.log(
            "Import response:",
            response.data
         );

         // Refresh suppliers
         await fetchSuppliers();

      } catch (error) {

         console.error(
            "Import suppliers error:",
            error
         );

         setImportProgress(0);

         alert(
            error?.response?.data?.message ||
            "Failed to import suppliers"
         );

      } finally {

         setImportLoading(false);

      }
   };


   const handleDeleteSelected = async () => {
      try {
         setDeleteLoading(true);
         const response = await deleteSelectedSuppliers(
            selectedSuppliers
         );
         console.log("Delete response:", response);
         await fetchSuppliers();
         setSelectedSuppliers([]);
         setShowDeleteConfirm(false);
      } catch (error) {
         console.error(
            "Delete selected suppliers error:",
            error
         );
      } finally {
         setDeleteLoading(false);
      }
   };



   const totalPages = Math.ceil(
      suppliers.length / suppliersPerPage
   );

   const indexOfLastSupplier =
      currentPage * suppliersPerPage;

   const indexOfFirstSupplier =
      indexOfLastSupplier - suppliersPerPage;

   const currentSuppliers = filteredSuppliers.slice(
      indexOfFirstSupplier,
      indexOfLastSupplier
   );


   return (
      <>
         <div>
            <LastParams />
         </div>
         <div className="bg-white mt-4 border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex justify-between px-5 py-4 border-b border-gray-200">
               <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                     Suppliers
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                     Manage your suppliers and their information.
                  </p>
               </div>
               <div className="">
                  <input
                     type="file"
                     accept=".csv"
                     id="supplier-csv-input"
                     className="hidden"
                     onChange={handleSupplierCSVSelect}
                  />

                  <button
                     type="button"
                     onClick={() =>
                        document
                           .getElementById("supplier-csv-input")
                           .click()
                     }
                     className="px-4 py-2 text-sm mr-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                     Import CSV
                  </button>
                  <button
                     type="button"
                     onClick={exportSuppliersCSV}
                     className="mr-2 px-4 py-2 border text-sm border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                     Export CSV
                  </button>
                  <button
                     onClick={() => {
                        setEditingSupplier(null);
                        setFormaData({
                           supplierName: "",
                           phone: "",
                           email: "",
                           address: "",
                           city: "",
                           state: "",
                           gstNumber: ""
                        });

                        setShowModal(true);
                     }}
                     className="px-4 py-2 bg-primary text-sm text-white rounded-lg hover:bg-blue-700 shadow-lg"
                  >
                     + Add Supplier
                  </button>
               </div>

            </div>

            <div className="w-full my-5">
               <div className="relative w-full p-2">

                  <input
                     type="text"
                     value={supplierSearch}
                     onChange={(e) => setSupplierSearch(e.target.value)}
                     placeholder="Search supplier..."
                     className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <svg
                     className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.05 6.05a7.5 7.5 0 0 0 10.6 10.6Z"
                     />
                  </svg>

               </div>
            </div>

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
                              {editingSupplier ? "Edit Supplier" : "Add Supplier"}
                           </button>

                        </div>

                     </form>

                  </div>

               </div>

            )}

            {showImportConfirm && !importSuccess && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

                  <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">

                     {/* Icon */}
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

                     {/* Title */}
                     <h3 className="text-lg font-semibold text-gray-900 text-center mt-4">
                        Import Suppliers?
                     </h3>

                     {/* Description */}
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

                     {/* Buttons */}
                     <div className="flex gap-3 mt-6">

                        <button
                           type="button"
                           onClick={() => {
                              setShowImportConfirm(false);
                              setImportFile(null);
                              setImportData([]);

                              const input =
                                 document.getElementById(
                                    "supplier-csv-input"
                                 );

                              if (input) {
                                 input.value = "";
                              }
                           }}
                           className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                           Cancel
                        </button>

                        <button
                           type="button"
                           onClick={handleImportSuppliers}
                           disabled={importLoading}
                           className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                           {importLoading ? (

                              <div className="mt-6">

                                 <div className="flex justify-between text-sm mb-2">

                                    <span className="text-gray-600">
                                       Importing suppliers...
                                    </span>

                                    <span className="font-semibold text-gray-900">
                                       {importProgress}%
                                    </span>

                                 </div>

                                 {/* Progress background */}
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

                           ) : importSuccess ? (

                              <div className="mt-6 text-center">

                                 {/* Green Tick */}
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
                                    onClick={() => {

                                       setShowImportConfirm(false);
                                       setImportSuccess(false);
                                       setImportProgress(0);
                                       setImportFile(null);
                                       setImportData([]);

                                       const input =
                                          document.getElementById(
                                             "supplier-csv-input"
                                          );

                                       if (input) {
                                          input.value = "";
                                       }

                                    }}
                                    className="mt-5 w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                                 >
                                    Done
                                 </button>

                              </div>

                           ) : (

                              <div className="">

                                 {/* <button
                                    type="button"
                                    onClick={() => {

                                       setShowImportConfirm(false);
                                       setImportFile(null);
                                       setImportData([]);

                                       const input =
                                          document.getElementById(
                                             "supplier-csv-input"
                                          );

                                       if (input) {
                                          input.value = "";
                                       }

                                    }}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                 >
                                    Cancel
                                 </button> */}

                                 <button
                                    type="button"
                                    onClick={handleImportSuppliers}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                                 >
                                    Confirm Import
                                 </button>

                              </div>

                           )}
                        </button>

                     </div>

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
                  <div className="flex justify-end m-2">
                     {selectedSuppliers.length > 0 && (
                        <button
                           onClick={() => setShowDeleteConfirm(true)}
                           className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700"
                        >
                           Delete Selected ({selectedSuppliers.length})
                        </button>
                     )}
                  </div>
                  <table className="w-full">
                     <thead className="bg-gray-50">
                        <tr>
                           <th>
                              <input
                                 type="checkbox"
                                 className="ml-2"
                                 checked={
                                    suppliers.length > 0 &&
                                    selectedSuppliers.length === suppliers.length
                                 }
                                 onChange={(e) => {
                                    if (e.target.checked) {
                                       setSelectedSuppliers(
                                          suppliers.map(
                                             (supplier) => supplier._id
                                          )
                                       );
                                    } else {
                                       setSelectedSuppliers([]);
                                    }
                                 }}
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
                     <tbody>
                        {currentSuppliers.map((supplier) => (
                           <tr
                              key={supplier._id}
                              className="border-t border-gray-100 hover:bg-gray-50"
                           >
                              <td>
                                 <input
                                    type="checkbox"
                                    className="ml-4"
                                    checked={selectedSuppliers.includes(supplier._id)}
                                    onChange={(e) => {
                                       if (e.target.checked) {
                                          setSelectedSuppliers((prev) => [
                                             ...prev,
                                             supplier._id
                                          ]);
                                       } else {
                                          setSelectedSuppliers((prev) =>
                                             prev.filter(
                                                (id) => id !== supplier._id
                                             )
                                          );
                                       }
                                    }}
                                 />
                              </td>
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
                                       onClick={() => handleEditSupplier(supplier)}
                                       className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                       Edit
                                    </button>
                                    <button
                                       onClick={() => handleDeleteSupplier(supplier)}
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
                  {totalPages > 1 && (
                     <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200">

                        {/* Showing information */}
                        <div className="text-sm text-gray-500">
                           Showing{" "}
                           <span className="font-medium text-gray-700">
                              {indexOfFirstSupplier + 1}
                           </span>
                           {" - "}
                           <span className="font-medium text-gray-700">
                              {Math.min(
                                 indexOfLastSupplier,
                                 suppliers.length
                              )}
                           </span>
                           {" of "}
                           <span className="font-medium text-gray-700">
                              {suppliers.length}
                           </span>
                           {" suppliers"}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center gap-2">

                           {/* Previous */}
                           <button
                              onClick={() =>
                                 setCurrentPage((prev) =>
                                    Math.max(prev - 1, 1)
                                 )
                              }
                              disabled={currentPage === 1}
                              className="px-3 py-2 text-sm border border-gray-300 rounded-lg
                           hover:bg-gray-50
                           disabled:opacity-40
                           disabled:cursor-not-allowed"
                           >
                              Previous
                           </button>

                           {/* Page Numbers */}
                           <div className="flex items-center gap-1">

                              {/* First page */}
                              <button
                                 onClick={() => setCurrentPage(1)}
                                 className={`w-9 h-9 text-sm rounded-lg border
            ${currentPage === 1
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

                                    if (page === 1 || page === totalPages) {
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
                                       onClick={() => setCurrentPage(page)}
                                       className={`w-9 h-9 text-sm rounded-lg border
                    ${currentPage === page
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
                                    onClick={() => setCurrentPage(totalPages)}
                                    className={`w-9 h-9 text-sm rounded-lg border
                ${currentPage === totalPages
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
                              onClick={() =>
                                 setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                 )
                              }
                              disabled={currentPage === totalPages}
                              className="px-3 py-2 text-sm border border-gray-300 rounded-lg
                           hover:bg-gray-50
                           disabled:opacity-40
                           disabled:cursor-not-allowed"
                           >
                              Next
                           </button>

                        </div>

                     </div>
                  )}
               </div>
            )}

            {showDeleteConfirm && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

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
                           {selectedSuppliers.length}
                        </span>{" "}
                        selected supplier
                        {selectedSuppliers.length > 1 ? "s" : ""}?
                     </p>

                     {/* Buttons */}
                     <div className="flex justify-center gap-3 mt-6">

                        {/* Cancel */}
                        <button
                           type="button"
                           onClick={() => setShowDeleteConfirm(false)}
                           disabled={deleteLoading}
                           className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                           Cancel
                        </button>

                        {/* Confirm */}
                        <button
                           type="button"
                           onClick={handleDeleteSelected}
                           disabled={deleteLoading}
                           className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                           {deleteLoading
                              ? "Deleting..."
                              : "Delete"}
                        </button>

                     </div>

                  </div>

               </div>
            )}
         </div>
      </>
   )
}