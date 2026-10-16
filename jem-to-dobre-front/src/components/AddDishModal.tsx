import React, { useState, useEffect } from "react";
import { X, Loader2, Plus, Image as ImageIcon } from "lucide-react";
import { API_BASE_URL } from '../config/api';

interface Ingredient {
  ingredientId: number;
  name: string;
  isAllergen: boolean;
}

interface AddDishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDishAdded: () => void;
  editDishId?: number | null;
}

export default function AddDishModal({
  isOpen,
  onClose,
  onDishAdded,
  editDishId,
}: AddDishModalProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientIsAllergen, setNewIngredientIsAllergen] = useState(false);
  const [isIngredientSaving, setIsIngredientSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: null as File | null,
    isActive: true,
    ingredientIDs: [] as number[],
  });

  const isEditMode = !!editDishId;

  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        image: null,
        isActive: true,
        ingredientIDs: [],
      });
    }
  }, [isOpen, editDishId]);

  const loadData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      const resIng = await fetch(`${API_BASE_URL}/Ingredients`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let allIngredients: Ingredient[] = [];
      if (resIng.ok) {
        allIngredients = await resIng.json();
        setIngredients(allIngredients);
      }

      if (isEditMode) {
        const resDish = await fetch(`${API_BASE_URL}/dishes/${editDishId}`);
        if (resDish.ok) {
          const dishData = await resDish.json();

          const ingIDs = dishData.ingredientNames
            .map((name: string) => {
              const found = allIngredients.find((i: any) => i.name === name);
              return found ? found.ingredientId : null;
            })
            .filter((id: number | null) => id !== null);

          setFormData({
            name: dishData.name,
            description: dishData.description || "",
            price: dishData.price.toString().replace(".", ","),
            image: null,
            isActive: dishData.isActive,
            ingredientIDs: ingIDs as number[],
          });
        }
      }
    } catch (error) {
      console.error("Błąd sieci", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAddIngredient = async () => {
    if (!newIngredientName.trim()) return;
    setIsIngredientSaving(true);
    const token = localStorage.getItem("token");

    try {
      const payload = {
        name: newIngredientName.trim(),
        isAllergen: newIngredientIsAllergen,
      };

      const res = await fetch(`${API_BASE_URL}/Ingredients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const createdIngredient: Ingredient = await res.json();
        setIngredients((prev) => [...prev, createdIngredient]);
        setFormData((prev) => ({
          ...prev,
          ingredientIDs: [
            ...prev.ingredientIDs,
            createdIngredient.ingredientId,
          ],
        }));
        setNewIngredientName("");
        setNewIngredientIsAllergen(false);
        setIsIngredientModalOpen(false);
      } else {
        const errorText = await res.text();
        alert(
          `Błąd dodawania składnika (Kod: ${res.status}).\n\nSzczegóły: ${errorText}`,
        );
      }
    } catch (error) {
      console.error("Błąd tworzenia składnika:", error);
      alert("Krytyczny błąd połączenia z API.");
    } finally {
      setIsIngredientSaving(false);
    }
  };

  const handleIngredientToggle = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredientIDs: prev.ingredientIDs.includes(id)
        ? prev.ingredientIDs.filter((ingId) => ingId !== id)
        : [...prev.ingredientIDs, id],
    }));
  };

  // Nowa funkcja obsługująca wyłącznie aktualizację zdjęcia (PATCH)
  const handleImageUpdate = async () => {
    if (!formData.image || !editDishId) return;
    setIsUploadingImage(true);
    const token = localStorage.getItem("token");

    try {
      const imgData = new FormData();
      imgData.append("image", formData.image); // Nazwa klucza 'image' zgodna z IFormFile? image w C#

      const res = await fetch(`${API_BASE_URL}/Dishes/${editDishId}/image`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: imgData,
      });

      if (res.ok) {
        alert("Zdjęcie zostało pomyślnie zaktualizowane!");
        setFormData((prev) => ({ ...prev, image: null })); // Resetujemy pole po udanym wysłaniu
        onDishAdded(); // Odświeżamy listę pod spodem, żeby nowe zdjęcie się zaczytało
      } else {
        const errText = await res.text();
        alert(
          `Odrzucono zmianę zdjęcia (Kod: ${res.status})\n\nTreść: ${errText}`,
        );
      }
    } catch (error) {
      console.error("Błąd aktualizacji zdjęcia:", error);
      alert("Krytyczny błąd sieci podczas wysyłania zdjęcia.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Główna funkcja Submit dla samego formularza (Tekst/JSON dla edycji lub całość dla dodawania)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem("token");

    try {
      let fetchBody: BodyInit;
      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
      };

      if (isEditMode) {
        headers["Content-Type"] = "application/json";
        const parsedPrice = parseFloat(
          formData.price.toString().replace(",", "."),
        );

        fetchBody = JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          price: isNaN(parsedPrice) ? 0 : parsedPrice,
          isActive: formData.isActive,
          ingredientIDs: formData.ingredientIDs,
        });
      } else {
        const submitData = new FormData();
        submitData.append("Name", formData.name);

        if (formData.description && formData.description.trim().length > 0) {
          submitData.append("Description", formData.description.trim());
        }

        const priceValue = parseFloat(
          formData.price.toString().replace(",", "."),
        )
          .toFixed(2)
          .replace(".", ",");
        submitData.append("Price", priceValue);
        submitData.append("IsActive", formData.isActive.toString());

        formData.ingredientIDs.forEach((id) => {
          submitData.append("IngredientIDs", id.toString());
        });

        if (formData.image) {
          submitData.append("Image", formData.image);
        }

        fetchBody = submitData;
      }

      const method = isEditMode ? "PUT" : "POST";
      const url = isEditMode
        ? `${API_BASE_URL}/Dishes/${editDishId}`
        : `${API_BASE_URL}/Dishes`;

      const res = await fetch(url, {
        method: method,
        headers: headers,
        body: fetchBody,
      });

      if (res.ok) {
        setFormData({
          name: "",
          description: "",
          price: "",
          image: null,
          isActive: true,
          ingredientIDs: [],
        });
        onDishAdded();
        onClose();
      } else {
        const errorData = await res.text();
        alert(
          `Odrzucono formularz! (Kod błędu: ${res.status})\n\nTreść zwrotna od backendu: ${errorData}`,
        );
      }
    } catch (error) {
      console.error("Błąd zapisu dania:", error);
      alert("Krytyczny błąd sieci.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b dark:border-slate-700">
            <h3 className="text-xl font-black dark:text-white">
              {isEditMode ? "Edytuj danie" : "Dodaj nowe danie"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
            >
              <X size={24} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar"
          >
            {isLoading && isEditMode ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-2" />
                <span className="text-gray-500 font-bold">
                  Ładowanie danych do edycji...
                </span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Nazwa dania *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Opis (opcjonalnie)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition resize-none"
                    />
                  </div>

                  {/* Rozdzielenie UI dla wgrywania plików w zależności od trybu */}
                  {isEditMode ? (
                    <div className="col-span-2 bg-blue-50/50 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700 p-4 rounded-xl">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                        <ImageIcon size={16} className="text-blue-500" /> Zmień
                        zdjęcie dania
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              image: e.target.files ? e.target.files[0] : null,
                            })
                          }
                          className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 dark:file:bg-blue-900/50 dark:file:text-blue-400 dark:text-gray-300"
                        />
                        <button
                          type="button"
                          onClick={handleImageUpdate}
                          disabled={!formData.image || isUploadingImage}
                          className="whitespace-nowrap px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-slate-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                        >
                          {isUploadingImage ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : null}
                          Wyślij plik
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <ImageIcon size={16} className="text-blue-500" />{" "}
                        Zdjęcie dania (opcjonalnie)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            image: e.target.files ? e.target.files[0] : null,
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Cena (zł) *
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition"
                    />
                  </div>

                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer font-bold dark:text-white group">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                        className="w-5 h-5 accent-blue-600 rounded transition group-active:scale-95"
                      />
                      Widoczne w menu
                    </label>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-3 mt-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Składniki dania *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsIngredientModalOpen(true)}
                      className="text-xs font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg"
                    >
                      <Plus size={14} /> Dodaj brakujący
                    </button>
                  </div>

                  {isLoading && !isEditMode ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
                      <Loader2
                        className="animate-spin text-blue-500"
                        size={20}
                      />{" "}
                      Pobieranie bazy...
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl custom-scrollbar">
                      {ingredients.map((ing) => (
                        <label
                          key={ing.ingredientId}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition select-none ${formData.ingredientIDs.includes(ing.ingredientId) ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold" : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800"}`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.ingredientIDs.includes(
                              ing.ingredientId,
                            )}
                            onChange={() =>
                              handleIngredientToggle(ing.ingredientId)
                            }
                            className="hidden"
                          />
                          {ing.name}{" "}
                          {ing.isAllergen && (
                            <span
                              className="text-red-500 font-black flex items-center justify-center bg-red-100 dark:bg-red-900/30 w-4 h-4 rounded-full text-[10px]"
                              title="Alergen"
                            >
                              !
                            </span>
                          )}
                        </label>
                      ))}
                      {ingredients.length === 0 && (
                        <span className="text-xs text-gray-400 p-2 text-center w-full block">
                          Brak składników w bazie. Dodaj swój pierwszy!
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t dark:border-slate-700 flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || formData.ingredientIDs.length === 0}
                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 transition flex items-center gap-2 shadow-lg shadow-green-500/20 disabled:bg-gray-400 dark:disabled:bg-slate-600 disabled:shadow-none"
                  >
                    {isSaving ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : null}{" "}
                    {isEditMode
                      ? "Zapisz zmiany (Bez obrazka)"
                      : "Zapisz danie"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>

      {isIngredientModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-lg font-black dark:text-white mb-4">
              Nowy składnik
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Nazwa składnika
                </label>
                <input
                  type="text"
                  value={newIngredientName}
                  onChange={(e) => setNewIngredientName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition"
                  autoFocus
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-bold dark:text-white group">
                <input
                  type="checkbox"
                  checked={newIngredientIsAllergen}
                  onChange={(e) => setNewIngredientIsAllergen(e.target.checked)}
                  className="w-5 h-5 accent-red-500 rounded transition group-active:scale-95"
                />
                To jest alergen (np. orzechy, nabiał)
              </label>
            </div>
            <div className="pt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsIngredientModalOpen(false)}
                className="px-4 py-2 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={handleQuickAddIngredient}
                disabled={isIngredientSaving || !newIngredientName.trim()}
                className="px-4 py-2 rounded-xl font-bold text-white bg-blue-500 hover:bg-blue-600 transition flex items-center gap-2 disabled:bg-gray-400 dark:disabled:bg-slate-700"
              >
                {isIngredientSaving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Zapisz do bazy"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
