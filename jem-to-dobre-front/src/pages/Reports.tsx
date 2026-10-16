import {
  AlertCircle,
  BarChart3,
  DollarSign,
  Download,
  Loader2,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { API_BASE_URL } from '../config/api';


interface SummaryData {
  totalOrders: number;
  totalRevenue: number;
}

interface PopularDish {
  dishName: string;
  quantitySold: number;
}

interface TimelineData {
  month: string;
  Przychód: number;
}

const Reports = () => {
  const navigate = useNavigate();
  const { items: cartItems } = useCart();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<SummaryData>({
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [popular, setPopular] = useState<PopularDish[]>([]);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);

  // Filtry czasu: 'month' (Ten miesiąc), 'year' (Ten rok), 'custom' (Własny zakres)
  const [timeFilter, setTimeFilter] = useState<"month" | "year" | "custom">(
    "month",
  );

  // Stany dla własnego zakresu dat (domyślnie: od miesiąca temu do dzisiaj)
  const [customStart, setCustomStart] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [customEnd, setCustomEnd] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || "";

    if (!token || (!role.includes("Menedżer") && !role.includes("Manager"))) {
      navigate("/");
      return;
    }

    // Automatycznie pobierz dane jeśli wybrano predefiniowany filtr
    if (timeFilter !== "custom") {
      fetchReportData();
    }
  }, [timeFilter]);

  // Umożliwienie pierwszego ładowania dla trybu custom, jeśli byłby kiedyś domyślny
  useEffect(() => {
    if (timeFilter === "custom") {
      fetchReportData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const baseUrl = `${API_BASE_URL}/Reports`;

    try {
      // 1. Ustalanie dat bazowych (format YYYY-MM-DD)
      const now = new Date();
      let startStr, endStr;

      if (timeFilter === "month") {
        const y = now.getFullYear();
        const m = (now.getMonth() + 1).toString().padStart(2, "0");
        const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
        startStr = `${y}-${m}-01`;
        endStr = `${y}-${m}-${lastDay.toString().padStart(2, "0")}`;
      } else if (timeFilter === "year") {
        const y = now.getFullYear();
        startStr = `${y}-01-01`;
        endStr = `${y}-12-31`;
      } else {
        startStr = customStart;
        endStr = customEnd;
      }

      // Formatowanie zgodne z API (np. 2026-06-24T00:00:00Z)
      const apiStart = `${startStr}T00:00:00Z`;
      const consiEnd = `${endStr}T23:59:59Z`;

      // 2. Pobieranie podsumowania i popularnych dań
      const summaryRes = await fetch(
        `${baseUrl}/summary?startDate=${apiStart}&endDate=${consiEnd}`,
        { headers },
      );
      const popularRes = await fetch(
        `${baseUrl}/popular?startDate=${apiStart}&endDate=${consiEnd}&limit=5`,
        { headers },
      );

      if (!summaryRes.ok || !popularRes.ok) {
        throw new Error(
          "Błąd pobierania raportów. Sprawdź format dat i połączenie.",
        );
      }

      const summaryData = await summaryRes.json();
      const popularData = await popularRes.json();

      setSummary(summaryData);
      setPopular(popularData);

      // 3. Rysowanie wykresu czasowego (Dynamiczna pętla między datą początkową a końcową)
      const timelinePromises = [];
      const monthNames = [
        "Sty",
        "Lut",
        "Mar",
        "Kwi",
        "Maj",
        "Cze",
        "Lip",
        "Sie",
        "Wrz",
        "Paź",
        "Lis",
        "Gru",
      ];

      const currentMonthIter = new Date(`${startStr}T00:00:00Z`);
      currentMonthIter.setDate(1); // Zaczynamy od pierwszego dnia miesiąca startowego
      const endLimit = new Date(`${endStr}T23:59:59Z`);

      let loops = 0;
      // Pętla pobierająca przychody dla każdego miesiąca oddzielnie (limit 36 miesięcy zapobiega zapętleniu przeglądarki)
      while (currentMonthIter <= endLimit && loops < 36) {
        const y = currentMonthIter.getFullYear();
        const m = currentMonthIter.getMonth();
        const mStr = (m + 1).toString().padStart(2, "0");
        const lastDay = new Date(y, m + 1, 0).getDate();

        const monthStart = `${y}-${mStr}-01T00:00:00Z`;
        const monthEnd = `${y}-${mStr}-${lastDay.toString().padStart(2, "0")}T23:59:59Z`;
        const label = `${monthNames[m]} ${y.toString().slice(-2)}`;

        timelinePromises.push(
          fetch(
            `${baseUrl}/summary?startDate=${monthStart}&endDate=${monthEnd}`,
            { headers },
          )
            .then((res) => res.json())
            .then((data) => ({
              month: label,
              Przychód: data.totalRevenue || 0,
            }))
            .catch(() => ({ month: label, Przychód: 0 })),
        );

        currentMonthIter.setMonth(currentMonthIter.getMonth() + 1);
        loops++;
      }

      const timelineResults = await Promise.all(timelinePromises);
      setTimeline(timelineResults);
    } catch (err: any) {
      setError(err.message || "Wystąpił błąd komunikacji z serwerem.");
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const rangeText =
      timeFilter === "month"
        ? "Ten miesiac"
        : timeFilter === "year"
          ? "Ten rok"
          : `${customStart} do ${customEnd}`;

    const rows = [
      ["Raport przychodow"],
      ["Okres:", rangeText],
      ["Calkowity Przychod:", `${summary.totalRevenue.toFixed(2)} PLN`],
      ["Liczba Zamowien:", summary.totalOrders],
      [""],
      ["TOP Dania", "Ilosc sprzedana"],
    ];

    popular.forEach((p) => {
      rows.push([p.dishName, p.quantitySold.toString()]);
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `raport_restauracja_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const aov =
    summary.totalOrders > 0
      ? (summary.totalRevenue / summary.totalOrders).toFixed(2)
      : "0.00";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 pb-10">
      <Navbar
        userRole={localStorage.getItem("role") || "Guest"}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onCartOpen={() => navigate("/checkout")}
        searchQuery={""}
        setSearchQuery={() => {}}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black dark:text-white flex items-center gap-3">
              <BarChart3 className="text-purple-500" size={32} /> Panel
              Analityczny
            </h2>
            <p className="text-gray-500 mt-1">
              Przeglądaj statystyki finansowe i sprzedażowe.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-slate-700 flex flex-wrap gap-1">
              <button
                onClick={() => setTimeFilter("month")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${timeFilter === "month" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
              >
                Ten miesiąc
              </button>
              <button
                onClick={() => setTimeFilter("year")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${timeFilter === "year" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
              >
                Ten rok
              </button>
              <button
                onClick={() => setTimeFilter("custom")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${timeFilter === "custom" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
              >
                Własny zakres
              </button>
            </div>

            {/* Opcje własnego zakresu dat pojawiają się dopiero po kliknięciu */}
            {timeFilter === "custom" && (
              <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm animate-in fade-in zoom-in-95">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-transparent text-sm font-bold text-gray-700 dark:text-gray-300 outline-none px-2 cursor-pointer"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-transparent text-sm font-bold text-gray-700 dark:text-gray-300 outline-none px-2 cursor-pointer"
                />
                <button
                  onClick={fetchReportData}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition"
                >
                  Generuj
                </button>
              </div>
            )}

            <button
              onClick={exportToCSV}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              <Download size={16} /> Pobierz CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-950/20 px-4 py-3 rounded-xl font-bold">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
            <p className="text-gray-500 font-bold">Ładowanie raportów...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Karty KPI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
                <div className="p-4 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-2xl">
                  <DollarSign size={28} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                    Całkowity Przychód
                  </p>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
                    {summary.totalRevenue.toFixed(2)} zł
                  </h3>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
                <div className="p-4 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-2xl">
                  <ShoppingBag size={28} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                    Zrealizowane Zamówienia
                  </p>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
                    {summary.totalOrders}
                  </h3>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
                <div className="p-4 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-2xl">
                  <TrendingUp size={28} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                    Średnia Wartość Zamówienia
                  </p>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
                    {aov} zł
                  </h3>
                </div>
              </div>
            </div>

            {/* Wykresy */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Wykres Liniowy (Przychody) */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 h-[450px] flex flex-col overflow-hidden">
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6">
                  Miesięczny Trend Przychodów
                </h3>
                <div className="flex-1 min-h-0 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={timeline}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#a855f7"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#a855f7"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#334155"
                        opacity={0.2}
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value}zł`}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value: any) => [
                          `${value.toFixed(2)} zł`,
                          "Przychód",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="Przychód"
                        stroke="#a855f7"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Wykres Słupkowy (Popularne Dania) */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 h-[450px] flex flex-col overflow-hidden">
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6">
                  Top 5 Najchętniej Wybieranych Dań
                </h3>
                <div className="flex-1 min-h-0 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={popular}
                      layout="vertical"
                      margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="#334155"
                        opacity={0.2}
                      />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="dishName"
                        type="category"
                        tick={{
                          fill: "#64748b",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                        axisLine={false}
                        tickLine={false}
                        width={120}
                      />
                      <Tooltip
                        cursor={{ fill: "transparent" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value: any) => [
                          `${value} szt.`,
                          "Sprzedano",
                        ]}
                      />
                      <Bar
                        dataKey="quantitySold"
                        fill="#3b82f6"
                        radius={[0, 8, 8, 0]}
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;
