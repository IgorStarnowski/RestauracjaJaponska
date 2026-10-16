import { useState, useEffect } from "react";
import { API_BASE_URL } from '../config/api';

interface Delivery {
  deliveryId: number;
  deliveryStatus: string;
  fullAddress: string;
}

const STATUS_MAP: Record<string, string> = {
  OczekujeNaKuriera: "Oczekuje",
  WDrodze: "W drodze",
  Dostarczone: "Dostarczono",
  Anulowane: "Anulowane",
};

const STATUS_COLOR: Record<string, string> = {
  OczekujeNaKuriera:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400",
  WDrodze:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400",
  Dostarczone:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400",
  Anulowane: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400",
};

export default function CourierPanel() {
  const [activeTab, setActiveTab] = useState<"available" | "my">("available");

  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>(
    [],
  );
  const [myDeliveries, setMyDeliveries] = useState<Delivery[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Pobieramy naraz dostępne zamówienia i przypisane do nas
      const [availableRes, myRes] = await Promise.all([
        fetch(`${API_BASE_URL}/Deliveries/available`, { headers }),
        fetch(`${API_BASE_URL}/Deliveries/me`, { headers }),
      ]);

      if (availableRes.ok && myRes.ok) {
        const availableData = await availableRes.json();
        const myData = await myRes.json();

        setAvailableDeliveries(availableData || []);
        setMyDeliveries(myData || []);
      } else {
        throw new Error("Błąd podczas pobierania statusów");
      }
    } catch (err: any) {
      console.error("Błąd pobierania danych z bazy:", err);
      setApiError(
        `Brak aktywnego połączenia z API (${err.message}). Upewnij się, że backend jest uruchomiony.`,
      );
      setAvailableDeliveries([]);
      setMyDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleAssign = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/Deliveries/${id}/assign`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        alert(`Pomyślnie przypisano zlecenie #${id}!`);
        // Po akceptacji automatycznie przełączamy na zakładkę "Moje" i odświeżamy
        setActiveTab("my");
        fetchDeliveries();
      } else {
        alert("Błąd: Nie udało się przypisać zlecenia.");
      }
    } catch (err) {
      alert("Błąd połączenia podczas przypisywania.");
    }
  };

  const handleComplete = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/Deliveries/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ deliveryStatus: "Dostarczone" }),
        },
      );

      if (response.ok) {
        alert(`Zlecenie #${id} pomyślnie dostarczone!`);
        fetchDeliveries();
      } else {
        alert("Błąd: Nie udało się zaktualizować statusu.");
      }
    } catch (err) {
      alert("Błąd połączenia podczas aktualizacji statusu.");
    }
  };

  // Wybieramy listę w zależności od aktywnej zakładki
  const currentDeliveries =
    activeTab === "available" ? availableDeliveries : myDeliveries;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm mb-6 border border-gray-200 dark:border-slate-700 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">
              Panel Dostawcy
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Podgląd i zarządzanie paczkami
            </p>
          </div>
          <button
            onClick={fetchDeliveries}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-xl transition shadow-lg shadow-emerald-500/30"
          >
            Odśwież
          </button>
        </div>

        {/* --- SYSTEM ZAKŁADEK --- */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("available")}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              activeTab === "available"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400"
            }`}
          >
            Dostępne zlecenia ({availableDeliveries.length})
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              activeTab === "my"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400"
            }`}
          >
            Moje dostawy ({myDeliveries.length})
          </button>
        </div>

        {apiError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm text-red-900">
            <p className="font-bold">Błąd połączenia:</p>
            <p className="text-sm">{apiError}</p>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500 text-xl mt-10">
            Pobieranie aktualnych danych z bazy...
          </p>
        ) : currentDeliveries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentDeliveries.map((delivery) => (
              <div
                key={delivery.deliveryId}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col transition-all hover:shadow-lg"
              >
                <div className="p-5 border-b border-gray-100 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-gray-400">
                      ID: #{delivery.deliveryId}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLOR[delivery.deliveryStatus] ?? "bg-gray-100 text-gray-800"}`}
                    >
                      {STATUS_MAP[delivery.deliveryStatus] ??
                        delivery.deliveryStatus}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <span>📍</span> {delivery.fullAddress}
                  </h3>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 flex flex-col gap-2 mt-auto">
                  {/* Przycisk akceptacji widoczny tylko w zakładce 'Dostępne' */}
                  {activeTab === "available" && (
                    <button
                      onClick={() => handleAssign(delivery.deliveryId)}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition active:scale-95 shadow-md shadow-blue-500/20"
                    >
                      Biorę to zamówienie
                    </button>
                  )}

                  {/* Przycisk dostarczenia widoczny tylko w zakładce 'Moje' dla zamówień, które nie są jeszcze dostarczone/anulowane */}
                  {activeTab === "my" &&
                    delivery.deliveryStatus !== "Dostarczone" &&
                    delivery.deliveryStatus !== "Anulowane" && (
                      <button
                        onClick={() => handleComplete(delivery.deliveryId)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition active:scale-95 shadow-md shadow-emerald-500/20"
                      >
                        ✅ Oznacz jako Dostarczone
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !apiError && (
            <div className="text-center bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 mt-4">
              <span className="text-7xl block mb-6 animate-bounce">
                {activeTab === "available" ? "🛵" : "📦"}
              </span>
              <h2 className="text-2xl font-black text-gray-700 dark:text-white mb-2">
                {activeTab === "available"
                  ? "Brak nowych zleceń"
                  : "Twój bagażnik jest pusty"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {activeTab === "available"
                  ? "W tym momencie nikt nie oczekuje na jedzenie. Poczekaj na nowe zamówienia."
                  : "Nie masz obecnie przypisanych żadnych paczek do rozwiezienia."}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
