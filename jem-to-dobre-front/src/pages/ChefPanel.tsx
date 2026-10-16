import {
  AlertCircle,
  CheckCircle,
  ChefHat,
  Clock,
  Loader2,
  Play,
  RotateCcw
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { API_BASE_URL } from '../config/api';

interface OrderItem {
  orderItemId: number;
  quantity: number;
  unitPrice: number;
  status: string;
  orderId: number;
  dishId: number;
  dishName: string;
  employeeName: string | null;
}

interface Order {
  orderId: number;
  orderDate: string;
  customerNotes: string | null;
  items: OrderItem[];
}

interface KanbanCard extends OrderItem {
  orderDate: string;
  customerNotes: string | null;
}

const ChefPanel = () => {
  const navigate = useNavigate();
  const { items: cartItems } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [estimatedTimes, setEstimatedTimes] = useState<Record<number, string>>(
    {},
  );

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
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
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

  const updateEstimatedTime = async (orderId: number) => {
    const minutes = estimatedTimes[orderId];
    if (!minutes) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_BASE_URL}/Orders/${orderId}/estimated-time`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estimatedTimeInMinutes: parseInt(minutes) }),
        },
      );
      if (response.ok) {
        fetchOrders();
        alert(`Ustawiono czas ${minutes} min dla zamówienia #${orderId}`);
      } else {
        alert("Błąd ustawiania czasu!");
      }
    } catch (error) {
      console.error("Błąd:", error);
    }
  };

  const updateItemStatus = async (
    orderId: number,
    itemId: number,
    newStatus: string,
  ) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_BASE_URL}/Orders/${orderId}/items/${itemId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderItemStatus: newStatus }),
        },
      );
      if (response.ok) {
        fetchOrders();
      } else {
        alert("Błąd zmiany statusu dania!");
      }
    } catch (error) {
      console.error("Błąd:", error);
    }
  };

  const allCards: KanbanCard[] = orders.flatMap((order) =>
    order.items.map((item) => ({
      ...item,
      orderDate: order.orderDate,
      customerNotes: order.customerNotes,
    })),
  );

  const normalizeStatus = (status: string | number) =>
    String(status).toUpperCase().replace(/\s+/g, "");

  const columnTodo = allCards.filter(
    (c) => normalizeStatus(c.status) === "OCZEKUJACE",
  );
  const columnInProgress = allCards.filter(
    (c) => normalizeStatus(c.status) === "WPRZYGOTOWANIU",
  );
  const columnDone = allCards.filter(
    (c) => normalizeStatus(c.status) === "GOTOWE",
  );

  const getElapsedMinutes = (dateString: string) => {
    const diff = new Date().getTime() - new Date(dateString).getTime();
    return Math.floor(diff / 60000);
  };

  const renderCard = (card: KanbanCard) => (
    <div
      key={card.orderItemId}
      className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="flex justify-between items-start border-b border-gray-100 dark:border-slate-700 pb-2 mb-2">
        <span className="text-xs font-black text-gray-400">
          Zamówienie #{card.orderId}
        </span>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${getElapsedMinutes(card.orderDate) > 20 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300"}`}
        >
          <Clock size={12} /> {getElapsedMinutes(card.orderDate)} min temu
        </span>
      </div>

      <div className="py-2">
        <h4 className="font-black text-lg text-slate-800 dark:text-white leading-tight">
          <span className="text-blue-500">{card.quantity}x</span>{" "}
          {card.dishName}
        </h4>
        {card.customerNotes && (
          <p className="text-xs font-bold text-orange-600 mt-2 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg italic">
            Notatka: {card.customerNotes}
          </p>
        )}
      </div>

      <div className="pt-3 mt-2 border-t border-gray-100 dark:border-slate-700 flex gap-2">
        {normalizeStatus(card.status) === "OCZEKUJACE" && (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2">
              <select
                value={estimatedTimes[card.orderId] || ""}
                onChange={(e) =>
                  setEstimatedTimes({
                    ...estimatedTimes,
                    [card.orderId]: e.target.value,
                  })
                }
                className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm dark:text-white outline-none"
              >
                <option value="">Czas (całe zamówienie)...</option>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
              </select>
              <button
                onClick={() => updateEstimatedTime(card.orderId)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition"
                title="Zatwierdź czas dla całego zamówienia"
              >
                <Clock size={16} />
              </button>
            </div>

            <button
              onClick={() =>
                updateItemStatus(
                  card.orderId,
                  card.orderItemId,
                  "WPrzygotowaniu",
                )
              }
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-1 transition"
            >
              <Play size={16} /> Rozpocznij danie
            </button>
          </div>
        )}

        {normalizeStatus(card.status) === "WPRZYGOTOWANIU" && (
          <>
            <button
              onClick={() =>
                updateItemStatus(card.orderId, card.orderItemId, "Oczekujace")
              }
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-300 p-2 rounded-lg transition"
              title="Cofnij"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() =>
                updateItemStatus(card.orderId, card.orderItemId, "Gotowe")
              }
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-1 transition shadow-lg shadow-green-500/20"
            >
              <CheckCircle size={16} /> Gotowe
            </button>
          </>
        )}

        {normalizeStatus(card.status) === "GOTOWE" && (
          <button
            onClick={() =>
              // Zmieniamy status na "Wydane" (lub inny docelowy z API), aby karta zniknęła z tablicy
              updateItemStatus(card.orderId, card.orderItemId, "Wydane")
            }
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-1 transition shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle size={16} /> Wydane / Gotowe
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar
        userRole={localStorage.getItem("role") || "Guest"}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onCartOpen={() => navigate("/checkout")}
        searchQuery={""}
        setSearchQuery={() => {}}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-6 flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-black dark:text-white flex items-center gap-3">
              <ChefHat className="text-blue-500" size={32} /> Ekran Kuchni
            </h2>
            <p className="text-gray-500 mt-1">
              Zarządzaj pojedynczymi daniami z zamówień.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-950/20 px-4 py-3 rounded-xl font-bold">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {isLoading && allCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            <div className="flex flex-col bg-gray-100/50 dark:bg-slate-800/50 rounded-2xl p-4 border border-gray-200 dark:border-slate-700 h-[70vh]">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider text-sm">
                  Do przygotowania
                </h3>
                <span className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs font-black px-2.5 py-1 rounded-full">
                  {columnTodo.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {columnTodo.map(renderCard)}
              </div>
            </div>

            <div className="flex flex-col bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30 h-[70vh]">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider text-sm">
                  W trakcie
                </h3>
                <span className="bg-blue-200 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 text-xs font-black px-2.5 py-1 rounded-full">
                  {columnInProgress.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {columnInProgress.map(renderCard)}
              </div>
            </div>

            <div className="flex flex-col bg-green-50/50 dark:bg-green-900/10 rounded-2xl p-4 border border-green-100 dark:border-green-900/30 h-[70vh]">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-black text-green-700 dark:text-green-400 uppercase tracking-wider text-sm">
                  Gotowe do wydania
                </h3>
                <span className="bg-green-200 dark:bg-green-800/50 text-green-700 dark:text-green-300 text-xs font-black px-2.5 py-1 rounded-full">
                  {columnDone.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {columnDone.map(renderCard)}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChefPanel;
