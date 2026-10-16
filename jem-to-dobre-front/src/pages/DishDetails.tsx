import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../config/api';
import {IMG_BASE_URL} from "../config/api";

import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShoppingBag,
  CheckCircle,
  Edit,
  Trash,
  RotateCcw,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import AddDishModal from "../components/AddDishModal"; // Upewnij się, że ścieżka jest poprawna

interface Dish {
  dishId: number;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  ingredientNames: string[];
  imageUrl?: string;
}

const DishDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [dish, setDish] = useState<Dish | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stan dla Modala Edycji
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const userRole = localStorage.getItem("role") || "";
  const isEmployee =
    userRole.includes("Menedżer") ||
    userRole.includes("Manager") ||
    userRole.includes("Kelner") ||
    userRole.includes("Kucharz") ||
    userRole.includes("Dostawca");
  const isManager =
    userRole.includes("Menedżer") || userRole.includes("Manager");

  const getImageUrl = (imageUrl?: string, dishId?: number) => {
    if (imageUrl) {
      return imageUrl.startsWith("http")
        ? imageUrl
        : `${IMG_BASE_URL}/${imageUrl.replace(/^\//, "")}`;
    }
    return `https://loremflickr.com/640/640/food?lock=${dishId}`;
  };

  const fetchDish = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/dishes/${id}`);

      if (!response.ok) throw new Error("Błąd serwera");
      const data = await response.json();
      setDish(data);
    } catch (err) {
      console.error("Błąd połączenia:", err);
      setError("Serwer nie odpowiada, ładuję dane awaryjne...");
      setDish({
        dishId: Number(id),
        name: "Epickie Danie z Błędu",
        description: "Brak połączenia z API.",
        price: 42.0,
        isActive: true,
        ingredientNames: ["Frontend", "Cierpliwość"],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDish();
  }, [id]);

  const handleAddToCart = () => {
    if (!dish) return;
    addToCart({ id: dish.dishId, name: dish.name, price: dish.price });

    setToastMessage(`Dodano: ${dish.name} 🍔`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDelete = async () => {
    if (!dish) return;
    const confirmDelete = window.confirm(
      "Czy na pewno chcesz usunąć (zdeztywować) to danie?",
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/dishes/${dish.dishId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setToastMessage("Danie zostało pomyślnie zdeztywowane! 🗑️");
        setTimeout(() => setToastMessage(null), 3000);
        fetchDish();
      } else {
        alert("Błąd podczas usuwania dania.");
      }
    } catch (err) {
      console.error(err);
      alert("Błąd połączenia z serwerem przy usuwaniu.");
    }
  };

  const handleRestore = async () => {
    if (!dish) return;

    try {
      const token = localStorage.getItem("token");

      const ingRes = await fetch(`${API_BASE_URL}/Ingredients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!ingRes.ok) throw new Error("Nie udało się pobrać listy składników.");

      const allIngredients = await ingRes.json();

      const ingredientIDs = dish.ingredientNames
        .map((name) => {
          const found = allIngredients.find((i: any) => i.name === name);
          return found ? found.ingredientId : null;
        })
        .filter((id) => id !== null);

      const putRes = await fetch(
        `${API_BASE_URL}/dishes/${dish.dishId}`, // Naprawione backticki
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: dish.name,
            description: dish.description || null,
            price: dish.price,
            isActive: true,
            ingredientIDs: ingredientIDs,
          }),
        },
      );

      if (putRes.ok) {
        setToastMessage("Danie zostało przywrócone! ♻️");
        setTimeout(() => setToastMessage(null), 3000);
        fetchDish();
      } else {
        const err = await putRes.text();
        alert("Błąd przywracania: " + err);
      }
    } catch (err) {
      console.error(err);
      alert("Błąd połączenia z serwerem przy przywracaniu.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!dish) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 font-bold mb-6 transition"
        >
          <ArrowLeft size={20} /> Wróć do menu
        </button>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-2 font-bold border border-red-100">
            <AlertCircle /> {error}
          </div>
        )}

        <div
          className={`bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row transition-all ${!dish.isActive ? "opacity-80" : ""}`}
        >
          <div className="md:w-1/2 aspect-square relative bg-gray-200">
            {!dish.isActive && (
              <div className="absolute top-4 left-4 bg-red-500 text-white font-black px-4 py-1.5 rounded-full z-10 shadow-lg">
                NIEAKTYWNE
              </div>
            )}
            <img
              src={getImageUrl(dish.imageUrl, dish.dishId)}
              alt={dish.name}
              className={`w-full h-full object-cover transition-all ${!dish.isActive ? "grayscale" : ""}`}
            />
          </div>

          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-start">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-tight mb-2">
              {dish.name}
            </h1>
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-6">
              {dish.price.toFixed(2)} zł
            </p>

            <div className="mb-6">
              <h3 className="font-bold text-gray-400 uppercase tracking-wider text-sm mb-3">
                Składniki
              </h3>
              <div className="flex flex-wrap gap-2">
                {dish.ingredientNames.map((ing) => (
                  <span
                    key={ing}
                    className="bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-gray-200 px-3 py-1 rounded-lg text-sm font-bold border border-gray-200 dark:border-slate-600"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {dish.description && (
              <div className="mb-10">
                <h3 className="font-bold text-gray-400 uppercase tracking-wider text-sm mb-2">
                  Opis
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {dish.description}
                </p>
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-slate-700">
              {!isEmployee && dish.isActive && (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-xl shadow-blue-500/30 flex justify-center items-center gap-3"
                >
                  <ShoppingBag size={24} />
                  DODAJ DO KOSZYKA
                </button>
              )}

              {isManager && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black transition-all active:scale-95 shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2"
                  >
                    <Edit size={20} /> EDYTUJ
                  </button>

                  {dish.isActive ? (
                    <button
                      onClick={handleDelete}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-black transition-all active:scale-95 shadow-lg shadow-red-500/30 flex justify-center items-center gap-2"
                    >
                      <Trash size={20} /> USUŃ
                    </button>
                  ) : (
                    <button
                      onClick={handleRestore}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-black transition-all active:scale-95 shadow-lg shadow-green-500/30 flex justify-center items-center gap-2"
                    >
                      <RotateCcw size={20} /> PRZYWRÓĆ
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddDishModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onDishAdded={() => {
          setIsEditModalOpen(false);
          fetchDish(); // Odśwież dane po zapisie
        }}
        editDishId={dish.dishId}
      />

      {toastMessage && (
        <div className="fixed bottom-10 right-10 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl font-black flex items-center gap-3 z-[100] animate-bounce">
          <CheckCircle size={24} />
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default DishDetails;
