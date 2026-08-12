import { useEffect, useState } from "react";
import {
   getReportSummary,
   getSalesOverview,
   getTopSellingProducts,
   getCategoryPerformance,
   getRecentTransactions
} from "../services/reportService";
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
      fetchTopProducts();
   }, [selectedRange]);

   useEffect(() => {
      fetchCategoryPerformance();
   }, [])

   const fetchReportSummary = async () => {
      try {
         setLoading(true);
         const data = await getReportSummary(selectedRange);
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
         const data = await getTopSellingProducts();

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

   const fetchRecentTransactions = async (filters = {}) => {
      try {
         setTransactionLoading(true);
         setTransactionError("");

         const data = await getRecentTransactions(filters);

         setTransactions(data.transactions || []);

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
      setTransactionFilters(prev => ({
         ...prev,
         [field]: value
      }));
   };

   const searchTransaction = (field) => {

      const value = transactionFilters[field];

      if (!value) {
         fetchRecentTransactions();
         return;
      }

      fetchRecentTransactions({
         [field]: value
      });
   };

   return (
      <div className="min-h-screen bg-gray-50 p-6">

         {/* Header */}
         <div className="flex items-center justify-between mb-6">

            <div>
               <h1 className="text-2xl font-bold text-gray-900">
                  Reports & Analytics
               </h1>

               <p className="text-sm text-gray-500 mt-1">
                  Track your shop performance, sales, products, and inventory.
               </p>
            </div>

            <div className="flex items-center gap-3">

               <select
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value)}
                  className="border border-gray-200 bg-white rounded-lg px-4 py-2 text-sm outline-none"
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
               >
                  ↓ Export Report
               </button>

            </div>

         </div>


         {/* Summary Cards */}
         <div className="grid grid-cols-4 gap-4 mb-5">

            <div className="bg-white border border-gray-200 rounded-xl p-5">
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


            <div className="bg-white border border-gray-200 rounded-xl p-5">
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


            <div className="bg-white border border-gray-200 rounded-xl p-5">
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


            <div className="bg-white border border-gray-200 rounded-xl p-5">
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


         {/* Filters */}
         <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">

            <div className="flex items-center gap-4">

               <span className="text-sm font-semibold">
                  Filters
               </span>

               <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
               >
                  <option value="all">
                     All Categories
                  </option>

                  <option value="electronics">
                     Electronics
                  </option>

                  <option value="grocery">
                     Grocery
                  </option>

                  <option value="clothing">
                     Clothing
                  </option>

                  <option value="accessories">
                     Accessories
                  </option>
               </select>


               <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
               >
                  <option value="all">
                     All Orders
                  </option>

                  <option value="completed">
                     Completed
                  </option>

                  <option value="processing">
                     Processing
                  </option>

                  <option value="pending">
                     Pending
                  </option>

                  <option value="cancelled">
                     Cancelled
                  </option>

                  <option value="failed">
                     Failed
                  </option>
               </select>


               <div className="ml-auto flex gap-2">

                  <button
                     type="button"
                     className="border border-gray-200 px-4 py-2 rounded-lg text-sm"
                  >
                     Reset
                  </button>

                  <button
                     type="button"
                     className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                     Apply Filters
                  </button>

               </div>

            </div>

         </div>


         {/* Charts will come here */}
         <div className="bg-white border border-gray-200 rounded-xl p-5 mt-5">
            <div className="mb-5">
               <h2 className="text-lg font-bold text-gray-900">
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

         {/* Top Selling Products */}
         <div className="bg-white border border-gray-200 rounded-xl p-5 mt-5">

            <div className="mb-5">
               <h2 className="text-lg font-bold text-gray-900">
                  Top Selling Products
               </h2>

               <p className="text-sm text-gray-500 mt-1">
                  Your best performing products by quantity sold.
               </p>
            </div>

            {topProducts.length === 0 ? (

               <div className="py-10 text-center text-gray-500">
                  No product sales available.
               </div>

            ) : (

               <div className="overflow-x-auto">

                  <table className="w-full">

                     <thead>
                        <tr className="border-b border-gray-200 text-left">

                           <th className="py-3 px-3 text-xs font-semibold text-gray-500">
                              Product
                           </th>

                           <th className="py-3 px-3 text-xs font-semibold text-gray-500">
                              Quantity Sold
                           </th>

                           <th className="py-3 px-3 text-xs font-semibold text-gray-500">
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
                                       <p className="text-sm font-semibold text-gray-900">
                                          {product.productName}
                                       </p>

                                       <p className="text-xs text-gray-400">
                                          Product ID: {product._id}
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

         {/* Category perfromance */}
         <div className="bg-white border border-gray-200 rounded-xl p-5 mt-5">

            <div className="mb-5">
               <h2 className="text-sm font-semibold text-gray-900">
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

               <div className="py-8 text-center text-sm text-gray-500">
                  No category data found.
               </div>

            ) : (

               <div className="overflow-x-auto">

                  <table className="w-full">

                     <thead>
                        <tr className="border-b border-gray-100">

                           <th className="text-left text-xs font-semibold text-gray-500 py-3">
                              Category
                           </th>

                           <th className="text-left text-xs font-semibold text-gray-500 py-3">
                              Products Sold
                           </th>

                           <th className="text-left text-xs font-semibold text-gray-500 py-3">
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

                              <td className="py-4 text-sm font-medium text-gray-900">
                                 {category.categoryName}
                              </td>

                              <td className="py-4 text-sm text-gray-600">
                                 {category.productsSold.toLocaleString("en-IN")}
                              </td>

                              <td className="py-4 text-sm font-semibold text-gray-900">
                                 ₹{category.totalSales.toLocaleString("en-IN")}
                              </td>

                           </tr>

                        ))}

                     </tbody>

                  </table>

               </div>

            )}

         </div>

         {/* Recent Transactions */}
         <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mt-6">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200">

               <h2 className="text-lg font-semibold text-gray-900">
                  Recent Transactions
               </h2>

               <p className="text-sm text-gray-500 mt-1">
                  View your latest sales and subscription transactions.
               </p>

            </div>


            {/* Filters */}
            <div className="p-5 border-b border-gray-200">

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">


                  {/* Customer Name */}
                  <div>

                     <label className="block text-xs font-medium text-gray-600 mb-1">
                        Customer Name
                     </label>

                     <div className="flex gap-2">

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
                           className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />

                        <button
                           type="button"
                           onClick={() => searchTransaction("customerName")}
                           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                           Search
                        </button>

                     </div>

                  </div>


                  {/* Product Name */}
                  <div>

                     <label className="block text-xs font-medium text-gray-600 mb-1">
                        Product / Plan
                     </label>

                     <div className="flex gap-2">

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
                           className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />

                        <button
                           type="button"
                           onClick={() => searchTransaction("productName")}
                           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                           Search
                        </button>

                     </div>

                  </div>


                  {/* Amount */}
                  <div>

                     <label className="block text-xs font-medium text-gray-600 mb-1">
                        Amount
                     </label>

                     <div className="flex gap-2">

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
                           className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />

                        <button
                           type="button"
                           onClick={() => searchTransaction("amount")}
                           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                           Search
                        </button>

                     </div>

                  </div>


                  {/* Status */}
                  <div>

                     <label className="block text-xs font-medium text-gray-600 mb-1">
                        Status
                     </label>

                     <div className="flex gap-2">

                        <select
                           value={transactionFilters.status}
                           onChange={(e) =>
                              handleTransactionFilterChange(
                                 "status",
                                 e.target.value
                              )
                           }
                           className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
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

                        <button
                           type="button"
                           onClick={() => searchTransaction("status")}
                           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                           Search
                        </button>

                     </div>

                  </div>


                  {/* Date */}
                  <div>

                     <label className="block text-xs font-medium text-gray-600 mb-1">
                        Date
                     </label>

                     <div className="flex gap-2">

                        <input
                           type="date"
                           value={transactionFilters.date}
                           onChange={(e) =>
                              handleTransactionFilterChange(
                                 "date",
                                 e.target.value
                              )
                           }
                           className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />

                        <button
                           type="button"
                           onClick={() => searchTransaction("date")}
                           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                           Search
                        </button>

                     </div>

                  </div>


                  {/* Type */}
                  <div>

                     <label className="block text-xs font-medium text-gray-600 mb-1">
                        Payment Type
                     </label>

                     <div className="flex gap-2">

                        <select
                           value={transactionFilters.type}
                           onChange={(e) =>
                              handleTransactionFilterChange(
                                 "type",
                                 e.target.value
                              )
                           }
                           className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
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

                        <button
                           type="button"
                           onClick={() => searchTransaction("type")}
                           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                           Search
                        </button>

                     </div>

                  </div>

               </div>


               {/* Reset */}
               <div className="flex justify-end mt-4">

                  <button
                     type="button"
                     onClick={() => {

                        const resetFilters = {
                           customerName: "",
                           productName: "",
                           amount: "",
                           status: "all",
                           date: "",
                           type: "all"
                        };

                        setTransactionFilters(resetFilters);

                        fetchRecentTransactions();

                     }}
                     className="border border-gray-200 hover:bg-gray-50 px-5 py-2 rounded-lg text-sm font-medium text-gray-700"
                  >
                     Reset Filters
                  </button>

               </div>

            </div>


            {/* Loading */}
            {transactionLoading ? (

               <div className="px-5 py-10 text-center text-gray-500">
                  Loading transactions...
               </div>

            ) : transactionError ? (

               <div className="px-5 py-10 text-center text-red-500">
                  {transactionError}
               </div>

            ) : transactions.length === 0 ? (

               <div className="px-5 py-10 text-center text-gray-500">
                  No transactions found.
               </div>

            ) : (

               /* Transactions Table */
               <div className="overflow-x-auto">

                  <table className="w-full min-w-[900px]">

                     <thead className="bg-gray-50">

                        <tr>

                           <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                              Transaction ID
                           </th>

                           <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                              Customer
                           </th>

                           <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                              Product / Plan
                           </th>

                           <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                              Amount
                           </th>

                           <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                              Status
                           </th>

                           <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                              Date
                           </th>

                           <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                              Type
                           </th>

                        </tr>

                     </thead>


                     <tbody>

                        {transactions.map((transaction) => (

                           <tr
                              key={`${transaction.transactionType}-${transaction.transactionId}`}
                              className="border-t border-gray-100 hover:bg-gray-50"
                           >

                              {/* Transaction ID */}
                              <td className="px-5 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                 {transaction.transactionId || "-"}
                              </td>


                              {/* Customer */}
                              <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                                 {transaction.customerName || "-"}
                              </td>


                              {/* Product / Plan */}
                              <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                                 {transaction.transactionName || "-"}
                              </td>


                              {/* Amount */}
                              <td className="px-5 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                                 ₹
                                 {Number(
                                    transaction.amount || 0
                                 ).toLocaleString("en-IN")}
                              </td>


                              {/* Status */}
                              <td className="px-5 py-4 whitespace-nowrap">

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


                              {/* Date */}
                              <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">

                                 {transaction.date
                                    ? new Date(
                                       transaction.date
                                    ).toLocaleDateString("en-IN")
                                    : "-"
                                 }

                              </td>


                              {/* Type */}
                              <td className="px-5 py-4 whitespace-nowrap">

                                 <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    {transaction.type || "-"}
                                 </span>

                              </td>

                           </tr>

                        ))}

                     </tbody>

                  </table>

               </div>

            )}

         </div>

      </div>
   );
}