import { useState, useEffect, useCallback } from "react";
import {
  Edit,
  Loader2,
  AlertCircle,
  CheckCircle,
  Trash,
  RotateCcw,
} from "lucide-react";
import Navbar from "../components/Navbar";
import CartDrawer from "../components/CartDrawer";
import { useCart } from "../context/CartContext";
import AddDishModal from "../components/AddDishModal";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../config/api';
import {IMG_BASE_URL} from "../config/api";

interface Dish {
  dishId: number;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  ingredientNames: string[];
  imageUrl?: string;
}

const tempImages: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
  2: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80",
  3: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&q=80",
  4: "https://plus.unsplash.com/premium_photo-1668146927669-f2edf6e86f6f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
};

const getImageUrl = (imageUrl?: string, dishId?: number) => {
  if (imageUrl) {
    return imageUrl.startsWith("http")
      ? imageUrl
      : `${IMG_BASE_URL}/${imageUrl.replace(/^\//, "")}`;
  }
  if (dishId && tempImages[dishId]) {
    return tempImages[dishId];
  }
  return `https://loremflickr.com/640/360/food?lock=${dishId}`;
};

const Home = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const { items: cartItems, addToCart: contextAddToCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stany dla Modala Dodawania / Edycji
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [editDishId, setEditDishId] = useState<number | null>(null);

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userRole = localStorage.getItem("role") || "Guest";
  const isClientOrGuest =
    userRole === "Guest" ||
    userRole.includes("Client") ||
    userRole.includes("Klient");
  const isManager =
    userRole.includes("Menedżer") || userRole.includes("Manager");

  const { t } = useTranslation();

  const fetchDishes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      let url = `${API_BASE_URL}/dishes`;
      const headers: HeadersInit = {};

      if (isManager && token) {
        url = `${API_BASE_URL}/dishes/all`;
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Błąd serwera: ${response.status}`);
      }

      const data: Dish[] = await response.json();
      setDishes(data);
    } catch (err: unknown) {
      console.error("Błąd połączenia z API:", err);
      setError(
        "Nie udało się połączyć z serwerem. Sprawdź czy backend działa!",
      );
    } finally {
      setIsLoading(false);
    }
  }, [isManager]);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  const addToCart = (dish: Dish) => {
    contextAddToCart({ id: dish.dishId, name: dish.name, price: dish.price });
    setToastMessage(`Dodano: ${dish.name} 🍔`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Czy na pewno chcesz usunąć (zdeztywować) to danie?",
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/dishes/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setToastMessage("Danie zostało pomyślnie zdeztywowane! 🗑️");
        setTimeout(() => setToastMessage(null), 3000);
        fetchDishes();
      } else {
        alert("Błąd podczas usuwania dania. Sprawdź uprawnienia.");
      }
    } catch {
      alert("Błąd połączenia z serwerem przy usuwaniu.");
    }
  };

  const handleRestore = async (dish: Dish) => {
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
        fetchDishes();
      } else {
        const err = await putRes.text();
        alert("Błąd przywracania: " + err);
      }
    } catch (err) {
      console.error(err);
      alert("Błąd połączenia z serwerem przy przywracaniu.");
    }
  };

  const filteredDishes = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar
        userRole={userRole}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onCartOpen={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddDishClick={() => {
          setEditDishId(null);
          setIsAddDishModalOpen(true);
        }}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black dark:text-white">
            {t("home.title")}
          </h2>
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm font-bold animate-bounce">
              <AlertCircle size={18} /> {t("home.error")}
            </div>
          )}
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500 font-bold">{t("home.loading")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-12">
            {filteredDishes.map((dish) => (
              <div
                key={dish.dishId}
                onClick={() => navigate(`/dish/${dish.dishId}`)}
                className={`group flex flex-col cursor-pointer bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm transition-all duration-300 ${!dish.isActive ? "opacity-60 grayscale hover:grayscale-0" : ""}`}
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-200 shadow-sm transition-all duration-300 group-hover:rounded-none group-hover:shadow-2xl">
                  {!dish.isActive && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] uppercase font-black px-2 py-1 rounded-lg z-20 shadow-md">
                      Nieaktywne
                    </span>
                  )}

                  <img
                    src={getImageUrl(dish.imageUrl, dish.dishId)}
                    alt={dish.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {isManager && (
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditDishId(dish.dishId);
                          setIsAddDishModalOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl backdrop-blur-md shadow-lg"
                      >
                        <Edit size={18} />
                      </button>

                      {dish.isActive ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(dish.dishId);
                          }}
                          className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-xl backdrop-blur-md shadow-lg"
                        >
                          <Trash size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(dish);
                          }}
                          className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-xl backdrop-blur-md shadow-lg"
                        >
                          <RotateCcw size={18} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-orange-100 shadow-sm">
                    <img
                      src="/Logo.jpg"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col flex-1">
                    <h3 className="font-bold text-lg leading-tight dark:text-white line-clamp-2 group-hover:text-blue-500 transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 italic">
                      {dish.ingredientNames.length > 0
                        ? dish.ingredientNames.join(", ")
                        : t("home.noIngredients")}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <span className="font-black text-xl text-slate-900 dark:text-white">
                        {dish.price.toFixed(2)} zł
                      </span>
                      {isClientOrGuest && dish.isActive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(dish);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2 rounded-full transition-all active:scale-90 shadow-md shadow-blue-500/20"
                        >
                          {t("home.addToCart")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <AddDishModal
        isOpen={isAddDishModalOpen}
        onClose={() => {
          setIsAddDishModalOpen(false);
          setEditDishId(null);
        }}
        onDishAdded={() => {
          setIsAddDishModalOpen(false);
          setEditDishId(null);
          fetchDishes();
        }}
        editDishId={editDishId}
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

export default Home;
