import { useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User, Search, Plus, Users, ClipboardList, ChefHat, BarChart3 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface NavbarProps {
    userRole?: string;
    cartCount: number;
    onCartOpen: () => void;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    onAddDishClick?: () => void;
}

const Navbar = ({
    cartCount,
    onCartOpen,
    searchQuery,
    setSearchQuery,
    onAddDishClick,
}: NavbarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();

    const [isLoggedIn] = useState(() => {
        const token = localStorage.getItem("token");
        return !!token;
    });

    const currentRole = localStorage.getItem("role") || "Guest";

    const canAddDish =
        currentRole.includes("Menedżer") ||
        currentRole.includes("Manager");

    const canViewCrew =
        currentRole.includes("Menedżer") ||
        currentRole.includes("Manager");

    const canViewOrders =
        currentRole.includes("Menedżer") ||
        currentRole.includes("Manager");

    const canViewKitchen = currentRole.includes("Menedżer") ||
        currentRole.includes("Manager") ||
        currentRole.includes("Kucharz") ||
        currentRole.includes("Kelner");

    const canViewReports = currentRole.includes("Menedżer") || currentRole.includes("Manager");

    const isClientOrGuest = currentRole === "Guest" || currentRole === "Client" || currentRole === "Klient";

    const handleProfileClick = () => {
        const currentToken = localStorage.getItem("token");
        if (currentToken) {
            navigate("/profile");
        } else {
            navigate("/login");
        }
    };

    const isEmployeeView = location.pathname === "/orders" || location.pathname === "/kitchen" || location.pathname === "/courier" || location.pathname === "/reports";

    return (
        <nav className="sticky top-0 z-50 w-full bg-white dark:bg-[#1a2233] shadow-md transition-colors duration-300 border-b border-gray-100 dark:border-slate-800">
            <div className="px-3 sm:px-4 py-3 flex items-center justify-between">
                <div
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 cursor-pointer flex-shrink-0"
                >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                            src="/Logo.jpg"
                            alt="Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-xl font-black dark:text-white">JemToDobre</span>
                </div>

                <div className="hidden md:block flex-1 max-w-md mx-6 relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={t("navbar.search")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-full outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition"
                    />
                </div>

                <div className="flex items-center gap-1 sm:gap-3">
                    {/* Cała sekcja przycisków zarządczych znika, kiedy jesteśmy w zakładce /orders */}
                    {(canAddDish || canViewCrew || canViewOrders || canViewKitchen) && !isEmployeeView && (//location.pathname !== "/orders" && (
                        <div className="flex items-center gap-1 sm:gap-2 pr-2 sm:pr-4 border-r border-gray-300 dark:border-slate-600">
                            {canAddDish && (
                                <button
                                    onClick={onAddDishClick}
                                    className="bg-green-500 hover:bg-green-600 text-white p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition active:scale-95"
                                >
                                    <Plus size={16} />
                                    <span className="hidden sm:inline">{t("navbar.dish")}</span>
                                </button>
                            )}

                            {canViewKitchen && (
                                <button onClick={() => navigate("/kitchen")} className="bg-orange-500 hover:bg-orange-600 text-white p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition active:scale-95">
                                    <ChefHat size={16} />
                                    <span className="hidden sm:inline">Kuchnia</span>
                                </button>
                            )}

                            {canViewOrders && (
                                <button
                                    onClick={() => navigate("/orders")}
                                    className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition active:scale-95"
                                >
                                    <ClipboardList size={16} />
                                    <span className="hidden sm:inline">{t("navbar.orders", "Zamówienia")}</span>
                                </button>
                            )}

                            {canViewCrew && (
                                <button
                                    onClick={() => navigate("/crew")}
                                    className="bg-purple-500 hover:bg-purple-600 text-white p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition active:scale-95"
                                >
                                    <Users size={16} />{" "}
                                    <span className="hidden sm:inline">{t("navbar.crew")}</span>
                                </button>
                            )}

                            {canViewReports && (
                                <button onClick={() => navigate("/reports")} className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition active:scale-95">
                                    <BarChart3 size={16} />
                                    <span className="hidden sm:inline">Raporty</span>
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-0 sm:gap-2">
                        {isClientOrGuest && (
                            <button
                                onClick={onCartOpen}
                                className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition relative active:scale-90"
                            >
                                <ShoppingCart className="w-6 h-6 sm:w-6 sm:h-6" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-[#1a2233]">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        )}

                        <button
                            onClick={handleProfileClick}
                            className={`p-1.5 sm:p-2 rounded-full transition border border-transparent active:scale-90 ${isLoggedIn
                                    ? "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    : "text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 hover:border-blue-500"
                                }`}
                        >
                            <User className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() =>
                                i18n.changeLanguage(i18n.language === "pl" ? "ja" : "pl")
                            }
                            className="p-1.5 sm:p-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition active:scale-90"
                        >
                            {i18n.language === "pl" ? "🇯🇵 JP" : "🇵🇱 PL"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="md:hidden px-4 pb-3 border-t border-gray-100 dark:border-slate-800">
                <div className="relative mt-2">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={t("navbar.search")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-full outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition"
                    />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;