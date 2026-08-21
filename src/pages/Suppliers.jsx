import { useEffect, useState } from "react";
import Papa from "papaparse";
import axios from "axios";
import LastParams from "../components/lastParams";

import {
   getSuppliers,
   createSupplier,
   updateSupplier,
   deleteSupplier,
   deleteSelectedSuppliers
} from "../services/supplierService"
import SupplierModal from "../components/suppliers/SupplierModal";
import ImportSupplierModal from "../components/suppliers/ImportSupplierModal";
import DeleteSupplierModal from "../components/suppliers/DeleteSupplierModal";
import SupplierTable from "../components/suppliers/SupplierTable";
import SupplierPagination from "../components/suppliers/SupplierPagination";

const API = process.env.REACT_APP_API_URL;

export default function Suppliers() {

   const [suppliers, setSuppliers] = useState([]);
   const [selectedSuppliers, setSelectedSuppliers] = useState([]);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const [deleteLoading, setDeleteLoading] = useState(false);

   const [currentPage, setCurrentPage] = useState(1);
   const suppliersPerPage = 10;

   const [loading, setLoading] = useState(true);

   const [error, setError] = useState('');
   const [supplierFormError, setSupplierFormError] = useState('');
   const [supplierSaving, setSupplierSaving] = useState(false);

   const [showModal, setShowModal] = useState(false);
   const [editingSupplier, setEditingSupplier] = useState(null);
   const [supplierSearch, setSupplierSearch] = useState("");
   const [importFile, setImportFile] = useState(null);
   const [importData, setImportData] = useState([]);
   const [showImportConfirm, setShowImportConfirm] = useState(false);
   const [importProgress, setImportProgress] = useState(0);
   const [importSuccess, setImportSuccess] = useState(false);
   const [importLoading, setImportLoading] = useState(false);


   const [formData, setFormData] = useState({
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
      setSupplierFormError("");

      setFormData({
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

      setFormData((prev) => ({
         ...prev,
         [name]: value
      }));
   };

   const handleCreateSupplier = async (e) => {
      e.preventDefault();

      try {
         setSupplierFormError("");
         setSupplierSaving(true);

         if (editingSupplier) {
            await updateSupplier(
               editingSupplier._id,
               formData
            );
         } else {
            await createSupplier(formData);
         }

         await fetchSuppliers();

         setShowModal(false);
         setEditingSupplier(null);

         setFormData({
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

         setSupplierFormError(
            error?.response?.data?.message ||
            "Failed to save supplier"
         );

      } finally {
         setSupplierSaving(false);
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
            `${API}/supplier/import`,
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

   useEffect(() => {
      setCurrentPage(1);
   }, [supplierSearch]);

   const totalPages = Math.ceil(
      filteredSuppliers.length / suppliersPerPage
   );

   const indexOfLastSupplier =
      currentPage * suppliersPerPage;

   const indexOfFirstSupplier =
      indexOfLastSupplier - suppliersPerPage;

   const currentSuppliers = filteredSuppliers.slice(
      indexOfFirstSupplier,
      indexOfLastSupplier
   );

   const handleCancelImport = () => {
      setShowImportConfirm(false);
      setImportFile(null);
      setImportData([]);

      const input = document.getElementById(
         "supplier-csv-input"
      );

      if (input) {
         input.value = "";
      }
   };

   const handleImportDone = () => {
      setShowImportConfirm(false);
      setImportSuccess(false);
      setImportProgress(0);
      setImportFile(null);
      setImportData([]);

      const input = document.getElementById(
         "supplier-csv-input"
      );

      if (input) {
         input.value = "";
      }
   };

   const handleSelectSupplier = (supplierId, checked) => {
      if (checked) {
         setSelectedSuppliers((prev) => [
            ...prev,
            supplierId
         ]);
      } else {
         setSelectedSuppliers((prev) =>
            prev.filter((id) => id !== supplierId)
         );
      }
   };

   const handleSelectAll = (checked) => {
      if (checked) {
         setSelectedSuppliers(
            currentSuppliers.map(
               (supplier) => supplier._id
            )
         );
      } else {
         setSelectedSuppliers([]);
      }
   };

   return (
      <>
         <div>
            <LastParams />
         </div>
         <div className="bg-white mt-4 border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between px-5 py-4 border-b border-gray-200">
               <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                     Suppliers
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                     Manage your suppliers and their information.
                  </p>
               </div>
               <div className="flex md:block mt-4 md:mt-0">
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
                     className="px-4 py-2 text-xs sm:text-sm mr-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                     Import CSV
                  </button>
                  <button
                     type="button"
                     onClick={exportSuppliersCSV}
                     className="mr-2 px-4 py-2 border text-xs sm:text-sm border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                     Export CSV
                  </button>
                  <button
                     onClick={() => {

                        setEditingSupplier(null);
                        setSupplierFormError("");
                        setFormData({
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
                     className="px-4 py-2 bg-primary text-xs sm:text-sm text-white rounded-lg hover:bg-blue-700 shadow-lg"
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

            <SupplierModal
               show={showModal}
               editingSupplier={editingSupplier}
               formData={formData}
               onChange={handleSupplierChange}
               onSubmit={handleCreateSupplier}
               onClose={() => setShowModal(false)}
               error={supplierFormError}
               loading={supplierSaving}
            />

            <ImportSupplierModal
               show={showImportConfirm}
               importData={importData}
               importLoading={importLoading}
               importProgress={importProgress}
               importSuccess={importSuccess}
               onConfirm={handleImportSuppliers}
               onCancel={handleCancelImport}
               onDone={handleImportDone}
            />


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

                  <SupplierTable
                     suppliers={currentSuppliers}
                     selectedSuppliers={selectedSuppliers}
                     onSelectSupplier={handleSelectSupplier}
                     onSelectAll={handleSelectAll}
                     onEdit={handleEditSupplier}
                     onDelete={handleDeleteSupplier}
                  />

                  <SupplierPagination
                     currentPage={currentPage}
                     totalPages={totalPages}
                     totalItems={filteredSuppliers.length}
                     itemsPerPage={suppliersPerPage}
                     onPageChange={setCurrentPage}
                  />


               </div>
            )}

            <DeleteSupplierModal
               show={showDeleteConfirm}
               selectedCount={selectedSuppliers.length}
               loading={deleteLoading}
               onCancel={() => setShowDeleteConfirm(false)}
               onConfirm={handleDeleteSelected}
            />

         </div>
      </>
   )
}