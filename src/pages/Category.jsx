import LastParams from "../components/lastParams";
import HeadingWithButton from "../components/Headings";

import SearchIcon from "../components/Icons/SearchIcon";
import FilterIcon from "../components/Icons/filterIcon";


import TotalProductIcon from "../components/Icons/product page icons/totalProductIcon";
import LowStockIcon from "../components/Icons/product page icons/lowStockIcon";
import ExpiringSoonIcon from "../components/Icons/product page icons/expiringSoonIcon";
import OutofStockIcon from "../components/Icons/product page icons/outOfStockIcon";

const AnalyticsData = [
    { id: 1, icon: TotalProductIcon, number: 16, content: "Total Product", color: "text-secondary", bg: "bg-[#F0FDFA]" },
    { id: 2, icon: LowStockIcon, number: 4, content: "Low Stock", color: "text-red-500", bg: "bg-[#FFFBEB]" },
    { id: 3, icon: ExpiringSoonIcon, number: 2, content: "Expiring Soon", color: "text-orange-500", bg: "bg-[#FFF7ED]" },
    { id: 4, icon: OutofStockIcon, number: 1, content: "Out Of Stock", color: "text-red-500", bg: "bg-[#FEF3F2]" }
]


const filterOption = [
    {
        placeholder: "All Categories",
        options: ["antibiotics", "DOLO"]
    }
]

export default function categoryPage() {
    return (
        <div>
            <LastParams />
            <HeadingWithButton
                mainheading="Product Categories"
                contentLine="17 categories"
                firstButton="Export"
                secondButton="Import"
                thirdButton="Add Category"
            />

            {/* stock div */}
            <div className="grid grid-cols-4 mt-5 gap-5">
                {AnalyticsData.map((items) => {
                    const Icons = items.icon;
                    return (
                        <div key={items.id} className="flex items-center gap-5 bg-white p-4 border border-[#E8ECF1] rounded-xl">
                            <div>
                                <Icons className={`h-9 w-9 ${items.color} ${items.bg} p-2 rounded`} />
                            </div>
                            <div>
                                <h2 className="font-semibold text-xl">{items.number}</h2>
                                <p className="text-xs font-medium text-text">{items.content}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* search filter */}
            <div className="bg-white p-4 border border-[#E8ECF1] rounded-xl mt-5 flex gap-5 items-center">
                <div className="flex border border-[#E8ECF1] p-2 rounded-lg w-[90%] gap-2 items-center">
                    <span>
                        <SearchIcon className="h-4 w-4" />
                    </span>
                    <input type="text" placeholder="Seacrh Products.." className="w-[100%] focus:outline-none focus:ring-0 text-sm text-text" />
                </div>
                <div className="flex gap-5 items-center w-[30%]">
                    <FilterIcon className="h-4 w-4" />
                    {filterOption.map((filter) => {
                        return (
                            <select key={filter.placeholder}
                                className="w-[100%] focus:outline-none focus:ring-0 border border-[#E8ECF1] rounded-lg py-2 px-4 text-text cursor-pointer">
                                <option value="">{filter.placeholder}</option>
                                {filter.options.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        );
                    })}
                </div>
            </div>

        </div>
    )
}