import LastParams from "../components/lastParams";
import { useEffect, useState } from "react";
import {
   getReportSummary,
   getSalesOverview,
   getTopSellingProducts,
   getCategoryPerformance,
   getRecentTransactions,
   exportReport
} from "../services/reportService";

import {
   getCategory
} from "../services/categoryService";
import {
   ResponsiveContainer,
   LineChart,
   Line,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip
} from "recharts";
export default function Reports() {

   const [dateRange, setDateRange] = useState("thisMonth");
   const [category, setCategory] = useState("all");
   const [orderStatus, setOrderStatus] = useState("all");
   const [selectedRange, setSelectedRange] = useState("thisMonth");
   const [categories, setCategories] = useState([]);
   const [topSellingType, setTopSellingType] = useState("quantity");
   const [transactionView, setTransactionView] = useState("subscription");

   const [summary, setSummary] = useState({
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      productsSold: 0
   });

   const [salesOverview, setSalesOverview] = useState([]);
   const [overviewLoading, setOverviewLoading] = useState(true);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [topProducts, setTopProducts] = useState([]);

   useEffect(() => {
      fetchReportSummary();
      fetchSalesOverview();

   }, [selectedRange]);

   useEffect(() => {
      fetchTopProducts();
   }, [topSellingType])

   useEffect(() => {
      fetchCategories();
      fetchCategoryPerformance();
   }, [])

   const fetchReportSummary = async () => {
      try {
         setLoading(true);
         const data = await getReportSummary(selectedRange, category);
         setSummary(data);
      } catch (err) {
         console.log(err);
         setError(err?.response?.data?.message || "something went Wrong");
      } finally {
         setLoading(false);
      }
   }

   const fetchSalesOverview = async () => {
      try {
         setOverviewLoading(true);
         const data = await getSalesOverview(selectedRange)
         console.log("sales overview: ", data)
         setSalesOverview(data.sales || []);
      } catch (err) {
         console.log(err);
      } finally {
         setOverviewLoading(false);
      }
   }

   const fetchTopProducts = async () => {
      try {
         const data = await getTopSellingProducts(topSellingType);
         setTopProducts(data.products || []);
      } catch (error) {
         console.log("Top products error:", error);
      }
   };

   const [categoryPerformance, setCategoryPerformance] = useState([]);
   const [categoryLoading, setCategoryLoading] = useState(true);
   const [categoryError, setCategoryError] = useState("");

   const fetchCategoryPerformance = async () => {
      try {
         setCategoryLoading(true);
         setCategoryError("");
         const data = await getCategoryPerformance();
         console.log("Category Performance:", data);
         setCategoryPerformance(data.categories || []);
      } catch (error) {
         console.log(
            "Category performance error:",
            error
         );
         setCategoryError(
            error?.response?.data?.message ||
            "Failed to load category performance"
         );
      } finally {
         setCategoryLoading(false);
      }
   };

   const [transactions, setTransactions] = useState([]);

   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [totalTransactions, setTotalTransactions] = useState(0);

   const transactionsPerPage = 10;

   const [transactionFilters, setTransactionFilters] = useState({
      customerName: "",
      productName: "",
      amount: "",
      status: "all",
      date: "",
      type: "all"
   });

   const [transactionLoading, setTransactionLoading] = useState(true);
   const [transactionError, setTransactionError] = useState("");

   useEffect(() => {
      fetchRecentTransactions();
   }, []);

   const fetchRecentTransactions = async (
      filters = {},
      page = 1
   ) => {
      try {
         setTransactionLoading(true);
         setTransactionError("");
         const data = await getRecentTransactions({
            ...filters,
            page,
            limit: transactionsPerPage
         });
         setTransactions(data.transactions || []);
         setCurrentPage(
            data.pagination?.currentPage || page
         );

         setTotalPages(
            data.pagination?.totalPages || 1
         );

         setTotalTransactions(
            data.pagination?.totalTransactions || 0
         );
      } catch (err) {
         console.log(err);
         setTransactionError(
            err?.response?.data?.message ||
            "Failed to load transactions"
         );
      } finally {
         setTransactionLoading(false);
      }
   };

   const handleTransactionFilterChange = (field, value) => {
      setTransactionFilters((prev) => ({
         ...prev,
         [field]: value
      }));
   };

   const handleApplyTransactionFilters = () => {
      const filters = {};

      Object.entries(transactionFilters).forEach(([key, value]) => {
         if (value && value !== "all") {
            filters[key] = value;
         }
      });
      setCurrentPage(1);
      fetchRecentTransactions(filters);
   };

   const handleResetTransactionFilters = () => {
      const resetFilters = {
         customerName: "",
         productName: "",
         amount: "",
         status: "all",
         date: "",
         type: "all"
      };

      setTransactionFilters(resetFilters);
      setCurrentPage(1);
      fetchRecentTransactions({});
   };


   const handleExportReport = async () => {

      try {

         const blob = await exportReport();

         const url = window.URL.createObjectURL(blob);

         const link = document.createElement("a");

         link.href = url;
         link.download = "sales-report.csv";

         document.body.appendChild(link);

         link.click();

         link.remove();

         window.URL.revokeObjectURL(url);

      } catch (error) {

         console.log("Export error:", error);

         alert(
            error?.response?.data?.message ||
            "Failed to export report"
         );
      }
   };

   const fetchCategories = async () => {
      try {
         const data = await getCategory();
         // console.log("full category response: ", data)
         // console.log("Categories:", data?.result);

         setCategories(data.result || []);
      } catch (error) {
         console.log("Category fetch error:", error);
      }
   };

   const handleReportFilters = () => {
      console.log("Selected category:", category);

      if (category === "all") {
         fetchReportSummary(selectedRange);
         fetchSalesOverview(selectedRange);
         fetchTopProducts();
         fetchCategoryPerformance();

         return;
      }

      // For now check that the category ID is correctly selected
      console.log("Filtering by category ID:", category);
   };

   const handleResetReportFilters = () => {
      setCategory("all");
      setOrderStatus("all");
   };

   const getActiveTransactionFilters = () => {

      const filters = {};

      Object.entries(transactionFilters).forEach(
         ([key, value]) => {

            if (value && value !== "all") {
               filters[key] = value;
            }

         }
      );

      return filters;
   };

   const handleTransactionPageChange = (page) => {

      if (page < 1 || page > totalPages) {
         return;
      }

      const filters = getActiveTransactionFilters();

      fetchRecentTransactions(filters, page);
   };

   const displayedTransactions = transactions.filter((transaction) => {

      if (transactionView === "subscription") {
         return transaction.transactionType === "subscription";
      }

      if (transactionView === "billing") {
         return transaction.transactionType === "order";
      }

      return true;
   });

   return (
      <div>
         <div>
            <LastParams />
         </div>
         <div className="min-h-screen bg-gray-50 dark:bg-darkColor dark:text-white p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
               <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                     Reports & Analytics
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                     Track your shop performance, sales, products, and inventory.
                  </p>
               </div>
               <div className="flex items-start w-full sm:w-auto sm:items-center mt-4 sm:mt-0 gap-3">
                  <select
                     value={selectedRange}
                     onChange={(e) => setSelectedRange(e.target.value)}
                     className="border border-gray-200 bg-white rounded-lg px-4 py-2 text-sm outline-none dark:bg-darkColor dark:text-white"
                  >
                     <option value="today">
                        Today
                     </option>
                     <option value="thisWeek">
                        This Week
                     </option>
                     <option value="thisMonth">
                        This Month
                     </option>
                     <option value="lastMonth">
                        Last Month
                     </option>
                     <option value="thisYear">
                        This Year
                     </option>
                     <option value="custom">
                        Custom Range
                     </option>
                  </select>
                  <button
                     type="button"
                     onClick={handleExportReport}
                     className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 dark:bg-black dark:text-white dark:border dark:border-white/30"
                  >
                     ↓ Export Report
                  </button>
               </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
               <div className="bg-white border border-gray-200 rounded-xl p-5 dark:bg-darkColor dark:text-white">
                  <p className="text-xs text-gray-500">
                     Total Sales
                  </p>
                  <h2 className="text-2xl font-bold mt-2">
                     ₹{summary.totalSales.toLocaleString("en-IN")}
                  </h2>
                  <p className="text-xs text-green-600 mt-2">
                     ↑ 12.4%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                     vs previous period
                  </p>
               </div>
               <div className="bg-white border border-gray-200 rounded-xl p-5 dark:bg-darkColor dark:text-white">
                  <p className="text-xs text-gray-500">
                     Total Orders
                  </p>
                  <h2 className="text-2xl font-bold mt-2">
                     {summary.totalOrders.toLocaleString("en-IN")}
                  </h2>
                  <p className="text-xs text-green-600 mt-2">
                     ↑ 8.2%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                     vs previous period
                  </p>
               </div>
               <div className="bg-white border border-gray-200 rounded-xl p-5 dark:bg-darkColor dark:text-white">
                  <p className="text-xs text-gray-500">
                     Avg Order Value
                  </p>
                  <h2 className="text-2xl font-bold mt-2">
                     ₹{summary.averageOrderValue.toLocaleString("en-IN", {
                        maximumFractionDigits: 2
                     })}
                  </h2>
                  <p className="text-xs text-red-500 mt-2">
                     ↓ 2.1%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                     vs previous period
                  </p>
               </div>
               <div className="bg-white border border-gray-200 rounded-xl p-5 dark:bg-darkColor dark:text-white">
                  <p className="text-xs text-gray-500">
                     Products Sold
                  </p>
                  <h2 className="text-2xl font-bold mt-2">
                     {summary.productsSold.toLocaleString("en-IN")}
                  </h2>
                  <p className="text-xs text-green-600 mt-2">
                     ↑ 18.7%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                     vs previous period
                  </p>
               </div>
            </div>

            {/* filters */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 dark:bg-darkColor dark:text-white">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center sm:w-auto w-full gap-4">
                     <span className="text-sm font-semibold">
                        Filters
                     </span>

                     <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border border-gray-200 rounded-lg sm:w-auto w-full px-3 py-2 text-sm dark:bg-darkColor dark:text-white"
                     >
                        <option value="all">
                           All Categories
                        </option>

                        {categories.map((item) => (
                           <option
                              key={item._id}
                              value={item._id}
                           >
                              {item.categoryName}
                           </option>
                        ))}
                     </select>
                  </div>
                  <div className="flex sm:w-auto w-full">
                     <div className="ml-auto w-full flex gap-2">
                        <button
                           type="button"
                           onClick={handleResetReportFilters}
                           className="border border-gray-200 px-4 py-2 sm:w-auto w-full rounded-lg text-sm"
                        >
                           Reset
                        </button>
                        <button
                           type="button"
                           onClick={handleReportFilters}
                           className="bg-blue-600 text-white px-4 py-2 sm:w-auto w-full rounded-lg text-sm dark:bg-black dark:text-white dark:border dark:border-white/30"
                        >
                           Apply Filters
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 mt-5 dark:bg-darkColor dark:text-white">
               <div className="mb-5">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                     Sales Overview
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                     Track your sales performance over time.
                  </p>
               </div>
               {overviewLoading ? (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                     Loading sales overview...
                  </div>
               ) : salesOverview.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                     No sales data available for this period.
                  </div>
               ) : (
                  <ResponsiveContainer width="100%" height={300}>
                     <LineChart data={salesOverview}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                           dataKey="_id"
                        />
                        <Tooltip />
                        <Line
                           type="monotone"
                           dataKey="totalSales"
                           stroke="#2563eb"
                           strokeWidth={3}
                           dot={{ r: 4 }}
                        />
                     </LineChart>
                  </ResponsiveContainer>
               )}
            </div>

            {/* Top Selling product */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 mt-5 dark:bg-darkColor dark:text-white">
               <div className="mb-5 flex items-start sm:items-center sm:gap-0 gap-4 justify-between">

                  <div>
                     <h2 className="sm:text-lg text-sm font-bold text-gray-900 dark:text-white">
                        Top Selling Products
                     </h2>

                     <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {topSellingType === "quantity"
                           ? "Your best performing products by quantity sold."
                           : "Your best performing products by total sales."
                        }
                     </p>
                  </div>

                  {/* Quantity / Price Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">

                     <button
                        type="button"
                        onClick={() => setTopSellingType("quantity")}
                        className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition ${topSellingType === "quantity"
                           ? "bg-white text-blue-600 shadow-sm"
                           : "text-gray-500 hover:text-gray-700"
                           }`}
                     >
                        Quantity
                     </button>

                     <button
                        type="button"
                        onClick={() => setTopSellingType("price")}
                        className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition ${topSellingType === "price"
                           ? "bg-white text-blue-600 shadow-sm"
                           : "text-gray-500 hover:text-gray-700"
                           }`}
                     >
                        Price
                     </button>

                  </div>

               </div>
               {topProducts.length === 0 ? (
                  <div className="py-10 text-center text-gray-500 dark:text-white">
                     No product sales available.
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full">
                        <thead>
                           <tr className="border-b border-gray-200 text-left">
                              <th className="py-3 px-3 text-xs font-semibold text-gray-500 dark:text-white">
                                 Product
                              </th>
                              <th className="py-3 px-3 text-xs font-semibold text-gray-500 dark:text-white">
                                 Quantity Sold
                              </th>
                              <th className="py-3 px-3 text-xs font-semibold text-gray-500 dark:text-white">
                                 Total Sales
                              </th>
                           </tr>
                        </thead>
                        <tbody>
                           {topProducts.map((product, index) => (
                              <tr
                                 key={product._id}
                                 className="border-b border-gray-100 last:border-b-0"
                              >
                                 <td className="py-4 px-3">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600">
                                          {index + 1}
                                       </div>
                                       <div>
                                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                             {product.productName}
                                          </p>
                                          <p className="text-xs text-gray-400">
                                          </p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="py-4 px-3">
                                    <span className="text-sm font-semibold">
                                       {product.quantitySold}
                                    </span>
                                 </td>
                                 <td className="py-4 px-3">
                                    <span className="text-sm font-semibold">
                                       ₹{product.totalSales.toLocaleString("en-IN")}
                                    </span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>

            {/* Category Performance */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 mt-5 dark:bg-darkColor dark:text-white">
               <div className="mb-5">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                     Category Performance
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                     Sales performance by product category.
                  </p>
               </div>
               {categoryLoading ? (
                  <div className="py-8 text-center text-sm text-gray-500">
                     Loading category performance...
                  </div>
               ) : categoryError ? (
                  <div className="py-8 text-center text-sm text-red-500">
                     {categoryError}
                  </div>
               ) : categoryPerformance.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-500 dark:text-white">
                     No category data found.
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full">
                        <thead>
                           <tr className="border-b border-gray-100">
                              <th className="text-left text-xs font-semibold text-gray-500 py-3 dark:text-white">
                                 Category
                              </th>
                              <th className="text-left text-xs font-semibold text-gray-500 py-3 dark:text-white">
                                 Products Sold
                              </th>
                              <th className="text-left text-xs font-semibold text-gray-500 py-3 dark:text-white">
                                 Total Sales
                              </th>
                           </tr>
                        </thead>
                        <tbody>
                           {categoryPerformance.map((category) => (
                              <tr
                                 key={category._id}
                                 className="border-b border-gray-100 last:border-b-0"
                              >
                                 <td className="py-4 text-sm font-medium text-gray-900 dark:text-white">
                                    {category.categoryName}
                                 </td>
                                 <td className="py-4 text-sm text-gray-600 dark:text-white">
                                    {category.productsSold.toLocaleString("en-IN")}
                                 </td>
                                 <td className="py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                    ₹{category.totalSales.toLocaleString("en-IN")}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>

            {/* Recent Transaction */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mt-6 dark:bg-darkColor dark:text-white">
               <div className="px-5 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-4 sm:gap-0 justify-between">

                     <div>
                        <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">
                           Recent Transactions
                        </h2>

                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                           View your latest sales and subscription transactions.
                        </p>
                     </div>

                     {/* Subscription / Billing Toggle */}
                     <div className="flex items-start sm:items-center bg-gray-100 rounded-lg p-1">

                        <button
                           type="button"
                           onClick={() => setTransactionView("subscription")}
                           className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition ${transactionView === "subscription"
                              ? "bg-white text-blue-600 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                              }`}
                        >
                           Subscription Plan
                        </button>

                        <button
                           type="button"
                           onClick={() => setTransactionView("billing")}
                           className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition ${transactionView === "billing"
                              ? "bg-white text-blue-600 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                              }`}
                        >
                           Billing Plan
                        </button>

                     </div>

                  </div>
               </div>
               <div className="p-5 border-b border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-white">
                           Customer Name
                        </label>
                        <input
                           type="text"
                           placeholder="Search customer"
                           value={transactionFilters.customerName}
                           onChange={(e) =>
                              handleTransactionFilterChange(
                                 "customerName",
                                 e.target.value
                              )
                           }
                           className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-darkColor dark:text-white"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-white">
                           Product / Plan
                        </label>
                        <input
                           type="text"
                           placeholder="Search product or plan"
                           value={transactionFilters.productName}
                           onChange={(e) =>
                              handleTransactionFilterChange(
                                 "productName",
                                 e.target.value
                              )
                           }
                           className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-darkColor dark:text-white" 
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-white">
                           Amount
                        </label>
                        <input
                           type="number"
                           placeholder="Enter amount"
                           value={transactionFilters.amount}
                           onChange={(e) =>
                              handleTransactionFilterChange(
                                 "amount",
                                 e.target.value
                              )
                           }
                           className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-darkColor dark:text-white"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-white">
                           Status
                        </label>
                        <select
                           value={transactionFilters.status}
                           onChange={(e) =>
                              handleTransactionFilterChange(
                                 "status",
                                 e.target.value
                              )
                           }
                           className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-darkColor dark:text-white"
                        >

                           <option value="all">
                              All Status
                           </option>

                           <option value="Paid">
                              Paid
                           </option>

                           <option value="Pending">
                              Pending
                           </option>

                           <option value="Failed">
                              Failed
                           </option>

                        </select>
                     </div>

                     <div>

                        <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-white">
                           Date
                        </label>

                        <input
                           type="date"
                           value={transactionFilters.date}
                           onChange={(e) =>
                              handleTransactionFilterChange(
                                 "date",
                                 e.target.value
                              )
                           }
                           className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-darkColor dark:text-white"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-white">
                           Payment Type
                        </label>
                        <select
                           value={transactionFilters.type}
                           onChange={(e) =>
                              handleTransactionFilterChange(
                                 "type",
                                 e.target.value
                              )
                           }
                           className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-darkColor dark:text-white"
                        >
                           <option value="all">
                              All Types
                           </option>
                           <option value="Cash">
                              Cash
                           </option>
                           <option value="Card">
                              Card
                           </option>
                           <option value="UPI">
                              UPI
                           </option>
                           <option value="Razorpay">
                              Razorpay
                           </option>
                        </select>
                     </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4">

                     <button
                        type="button"
                        onClick={handleResetTransactionFilters}
                        className="border border-gray-200 hover:bg-gray-50 px-5 py-2 rounded-lg text-sm font-medium text-gray-700 dark:bg-darkColor dark:text-white"
                     >
                        Reset Filters
                     </button>

                     <button
                        type="button"
                        onClick={handleApplyTransactionFilters}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium dark:bg-black dark:text-white dark:border dark:border-white/30"
                     >
                        Apply Filters
                     </button>

                  </div>

               </div>
               {transactionLoading ? (
                  <div className="px-5 py-10 text-center text-gray-500">
                     Loading transactions...
                  </div>
               ) : transactionError ? (
                  <div className="px-5 py-10 text-center text-red-500">
                     {transactionError}
                  </div>
               ) : displayedTransactions.length === 0 ? (
                  <div className="px-5 py-10 text-center text-gray-500">
                     No transactions found.
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full min-w-[900px]">
                        <thead className="bg-gray-50 dark:bg-darkColor dark:text-white">
                           <tr>
                              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap dark:text-white">
                                 Transaction ID
                              </th>
                              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap dark:text-white">
                                 Customer
                              </th>
                              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap dark:text-white">
                                 Product / Plan
                              </th>
                              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap dark:text-white">
                                 Amount
                              </th>
                              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap dark:text-white">
                                 Status
                              </th>
                              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap dark:text-white">
                                 Date
                              </th>
                              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap dark:text-white">
                                 Type
                              </th>
                           </tr>
                        </thead>
                        <tbody>
                           {displayedTransactions.map((transaction) => (
                              <tr
                                 key={`${transaction.transactionType}-${transaction.transactionId}`}
                                 className="border-t border-gray-100 hover:bg-gray-50"
                              >
                                 <td className="px-5 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:bg-darkColor dark:text-white">
                                    {transaction.transactionId || "-"}
                                 </td>
                                 <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap dark:bg-darkColor dark:text-white">
                                    {transaction.customerName || "-"}
                                 </td>
                                 <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap dark:bg-darkColor dark:text-white">
                                    {transaction.transactionName || "-"}
                                 </td>
                                 <td className="px-5 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:bg-darkColor dark:text-white">
                                    ₹
                                    {Number(
                                       transaction.amount || 0
                                    ).toLocaleString("en-IN")}
                                 </td>
                                 <td className="px-5 py-4 whitespace-nowrap dark:bg-darkColor dark:text-white">
                                    <span
                                       className={`
                              px-2.5
                              py-1
                              rounded-full
                              text-xs
                              font-medium
                              ${transaction.status?.toLowerCase() === "paid"
                                             ? "bg-green-100 text-green-700"
                                             : transaction.status?.toLowerCase() === "failed"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-yellow-100 text-yellow-700"
                                          }
                           `}
                                    >
                                       {transaction.status || "-"}
                                    </span>
                                 </td>
                                 <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap dark:bg-darkColor dark:text-white">
                                    {transaction.date
                                       ? new Date(
                                          transaction.date
                                       ).toLocaleDateString("en-IN")
                                       : "-"
                                    }
                                 </td>
                                 <td className="px-5 py-4 whitespace-nowrap dark:bg-darkColor dark:text-white">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                       {transaction.type || "-"}
                                    </span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                     {totalTransactions > 0 && (
                        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200">

                           <p className="text-sm text-gray-500 dark:bg-darkColor dark:text-white">
                              Showing{" "}
                              <span className="font-medium text-gray-700 dark:bg-darkColor dark:text-white">
                                 {(currentPage - 1) * transactionsPerPage + 1}
                              </span>
                              {" "}to{" "}
                              <span className="font-medium text-gray-700 dark:bg-darkColor dark:text-white">
                                 {Math.min(
                                    currentPage * transactionsPerPage,
                                    totalTransactions
                                 )}
                              </span>
                              {" "}of{" "}
                              <span className="font-medium text-gray-700 dark:bg-darkColor dark:text-white">
                                 {totalTransactions}
                              </span>
                              {" "}transactions
                           </p>

                           <div className="flex items-center gap-2">

                              <button
                                 type="button"
                                 disabled={currentPage === 1}
                                 onClick={() =>
                                    handleTransactionPageChange(
                                       currentPage - 1
                                    )
                                 }
                                 className="px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                              >
                                 Previous
                              </button>

                              <span className="px-3 py-2 text-sm font-medium">
                                 Page {currentPage} of {totalPages}
                              </span>

                              <button
                                 type="button"
                                 disabled={currentPage === totalPages}
                                 onClick={() =>
                                    handleTransactionPageChange(
                                       currentPage + 1
                                    )
                                 }
                                 className="px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                              >
                                 Next
                              </button>

                           </div>

                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}