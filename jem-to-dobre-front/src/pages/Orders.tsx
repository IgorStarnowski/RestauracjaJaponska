import {
    AlertCircle,
    Banknote,
    Clock,
    CreditCard,
    Loader2,
    XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { API_BASE_URL } from '../config/api';


interface OrderItem {
  orderItemId: number;
  dishName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  orderId: number;
  orderDate: string;
  estimatedPreparationTime: string | null;
  status: number | string; // Obsługa zarówno typów int jak i string
  orderType: number;
  customerNotes: string | null;
  totalPrice: number;
  clientName: string | null;
  isPaid: boolean;
  items: OrderItem[];
}

const Orders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items: cartItems } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || "";

    if (!token) {
      navigate("/login-employees");
      return;
    }

    const hasAccess = ["Menedżer", "Manager", "Kucharz", "Kelner"].some((r) =>
      role.includes(r),
    );
    if (!hasAccess) {
      navigate("/");
      return;
    }
  }, [navigate]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      if (orders.length === 0) setIsLoading(true);
      setError(null);
      const response = await fetch(
        `${API_BASE_URL}/Orders/active`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Brak uprawnień. Zaloguj się ponownie.");
        }
        throw new Error(`Błąd serwera: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data);
    } catch (err: unknown) {
      console.error("Błąd pobierania zamówień:", err);
      setError(
        err instanceof Error ? err.message : "Nie udało się pobrać zamówień.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateOrderStatus = async (orderId: number, statusValue: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_BASE_URL}/Orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderStatus: statusValue }),
        },
      );
      if (response.ok) {
        fetchOrders();
      } else {
        alert("Błąd zmiany statusu!");
      }
    } catch (error) {
      console.error("Błąd:", error);
    }
  };

  // Uodpornione mapowanie kolorów
  const getStatusColor = (status: number | string) => {
    const s = String(status).toLowerCase();
    switch (s) {
      case "0":
      case "new":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "1":
      case "inprogress":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "2":
      case "ready":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "3":
      case "delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "5":
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  // Uodpornione mapowanie nazw
  const getStatusLabel = (status: number | string) => {
    const s = String(status).toUpperCase();
    switch (s) {
      case "0":
      case "NOWE":
        return "NOWE";
      case "1":
      case "WPRZYGOTOWANIU":
        return "W PRZYGOTOWANIU";
      case "2":
      case "GOTOWE":
        return "GOTOWE";
      case "3":
      case "WDOSTAWIE":
        return "W DOSTAWIE";
      case "4":
      case "ZAKONCZONE":
        return "ZAKOŃCZONE";
      case "5":
      case "ANULOWANE":
        return "ANULOWANE";
      default:
        return "NIEZNANY";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar
        userRole={localStorage.getItem("role") || "Guest"}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onCartOpen={() => navigate("/checkout")}
        searchQuery={""}
        setSearchQuery={() => {}}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black dark:text-white">
              {t("orders.title", "Zarządzanie Zamówieniami")}
            </h2>
            <p className="text-gray-500 mt-1">
              {t(
                "orders.subtitle",
                "Przeglądaj i aktualizuj statusy w czasie rzeczywistym.",
              )}
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 px-4 py-2 rounded-xl font-bold transition"
          >
            {t("orders.refresh", "Odśwież")}
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-950/20 px-4 py-3 rounded-xl font-bold">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {isLoading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4 border-b border-gray-100 dark:border-slate-700 pb-4">
                  <div>
                    <h3 className="text-xl font-black dark:text-white">
                      #{order.orderId}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                    {order.isPaid ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 dark:bg-green-900/10 dark:border-green-900/30">
                        <CreditCard size={14} /> Opłacone
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200 dark:bg-orange-900/10 dark:border-orange-900/30">
                        <Banknote size={14} /> Przy odbiorze
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 mb-4">
                  <p className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Klient:{" "}
                    <span className="text-blue-600 dark:text-blue-400">
                      {order.clientName || "Brak danych"}
                    </span>
                  </p>
                  <div className="space-y-1 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-xl">
                    {order.items?.map((item) => (
                      <div
                        key={item.orderItemId}
                        className="flex justify-between text-sm"
                      >
                        <span className="dark:text-gray-300">
                          <span className="font-black text-gray-400">
                            {item.quantity}x
                          </span>{" "}
                          {item.dishName}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.customerNotes && (
                    <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl">
                      <p className="text-xs font-bold text-orange-800 dark:text-orange-400 mb-1">
                        Notatka od klienta:
                      </p>
                      <p className="text-sm text-orange-700 dark:text-orange-300 italic">
                        "{order.customerNotes}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Sekcja przycisków */}
                <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-slate-700">
                  {/* Przycisk odwołania */}
                  <button
                    onClick={() => updateOrderStatus(order.orderId, 5)} // 5 = Cancelled
                    className="w-full bg-red-100 hover:bg-red-200 text-red-600 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2"
                    title="Odwołaj zamówienie"
                  >
                    <XCircle size={18} /> Odwołaj zamówienie
                  </button>

                  {/* Informacja o czasie */}
                  {order.estimatedPreparationTime &&
                    String(order.status).toLowerCase() !== "3" &&
                    String(order.status).toLowerCase() !== "delivered" &&
                    String(order.status).toLowerCase() !== "5" &&
                    String(order.status).toLowerCase() !== "cancelled" && (
                      <p className="text-center text-xs font-bold text-gray-400 flex items-center justify-center gap-1 mt-1">
                        <Clock size={14} /> Szacowany czas:{" "}
                        {new Date(
                          order.estimatedPreparationTime,
                        ).toLocaleTimeString()}
                      </p>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
