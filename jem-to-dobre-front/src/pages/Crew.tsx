import { useState, useEffect } from "react";
import { Plus, Edit, UserMinus, X, Shield, AlertCircle } from "lucide-react";
import { API_BASE_URL } from '../config/api';

interface EmployeeResponseDto {
  employeeId: number;
  login: string;
  name: string;
  lastName: string;
  roleNames: string[];
  dishIds?: number[];
}

interface UpdateEmployeeDto {
  login: string;
  name: string;
  lastName: string;
  roleIds: number[];
}

interface Dish {
  dishId?: number;
  DishId?: number;
  name?: string;
  Name?: string;
}

const Available_Roles = [
  { id: 1, name: "Menedżer" },
  { id: 4, name: "Kucharz" },
  { id: 3, name: "Kelner" },
  { id: 2, name: "Dostawca" },
];

const Crew = () => {
  const userRole = localStorage.getItem("role") || "Guest";
  const isManager =
    userRole.includes("Menedżer") || userRole.includes("Manager");

  const [employees, setEmployees] = useState<EmployeeResponseDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [selectedDishIds, setSelectedDishIds] = useState<number[]>([]);

  const [formData, setFormData] = useState<UpdateEmployeeDto>({
    login: "",
    name: "",
    lastName: "",
    roleIds: [] as number[],
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Employees`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(Array.isArray(data) ? data : data?.$values || []);
      }
    } catch (error) {
      console.error("Błąd pobierania pracowników: ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDishes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Dishes`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        const dishesArray = Array.isArray(data)
          ? data
          : data && Array.isArray(data.$values)
            ? data.$values
            : [];
        setAllDishes(dishesArray);
      }
    } catch (error) {
      console.error("Błąd pobierania dań: ", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDishes();
  }, []);

  const handleRoleToggle = (roleId: number) => {
    setFormData((prev) => {
      const hasRole = prev.roleIds.includes(roleId);
      return {
        ...prev,
        roleIds: hasRole
          ? prev.roleIds.filter((id) => id !== roleId)
          : [...prev.roleIds, roleId],
      };
    });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ login: "", name: "", lastName: "", roleIds: [] });
    setSelectedDishIds([]);
    setIsModalOpen(true);
  };

  const openEditModal = (emp: EmployeeResponseDto) => {
    setEditingId(emp.employeeId);

    const safeRoleNames = emp.roleNames || [];
    const currentRoleIds = Available_Roles.filter((r) =>
      safeRoleNames.some(
        (backendRole) =>
          backendRole.toLowerCase().trim() === r.name.toLowerCase().trim(),
      ),
    ).map((r) => r.id);

    setFormData({
      login: emp.login,
      name: emp.name,
      lastName: emp.lastName,
      roleIds: currentRoleIds,
    });

    setSelectedDishIds(emp.dishIds || []);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      let currentEmpId = editingId;
      let generatedPassword = "";

      if (editingId) {
        const response = await fetch(
          `${API_BASE_URL}/Employees/${editingId}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(formData),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          alert(
            `Błąd edycji!\nKod: ${response.status}\nSzczegóły: ${errorText}`,
          );
          return;
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/Employees`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const data = await response.json();
          currentEmpId = data?.employeeId ?? data?.EmployeeId ?? data?.id;
          generatedPassword =
            data?.generatedPassword ?? data?.GeneratedPassword ?? "";
        } else {
          const errorText = await response.text();
          alert(
            `Błąd dodawania!\nKod: ${response.status}\nSzczegóły: ${errorText}`,
          );
          return;
        }
      }

      // Sprawdzamy po nazwie, a nie po sztywnym ID! Odporne na zmiany w bazie
      const isChef = Available_Roles.filter((r) =>
        formData.roleIds.includes(r.id),
      ).some((r) => r.name === "Kucharz");

      if (isChef && currentEmpId) {
        const patchResponse = await fetch(
          `${API_BASE_URL}/Employees/${currentEmpId}/dishes`,
          {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({ dishIds: selectedDishIds }),
          },
        );

        if (!patchResponse.ok) {
          console.error(
            "Wystąpił problem z przypisaniem dań do kucharza.",
            patchResponse.status,
          );
        }
      }

      if (!editingId) {
        alert(
          `Sukces! Pracownik dodany.\n\n⚠️ PRZEKAŻ MU TO HASŁO:\n${generatedPassword || "[Brak hasła]"}\n\nHasło wyświetla się tylko raz!`,
        );
      }

      setIsModalOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error("Błąd połączenia z API: ", error);
      alert("CRITICAL ERROR: Nie można połączyć z API!");
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = window.confirm(
      "Czy na pewno chcesz usunąć tego pracownika?",
    );
    if (!isConfirmed) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/Employees/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );

      if (response.ok) {
        fetchEmployees();
      } else {
        const errorText = await response.text();
        alert(
          `Nie udało się usunąć pracownika!\nKod: ${response.status}\nSzczegóły: ${errorText}`,
        );
      }
    } catch (error) {
      console.error("Błąd połączenia przy usuwaniu: ", error);
    }
  };

  const isChefForm = Available_Roles.filter((r) =>
    formData.roleIds.includes(r.id),
  ).some((r) => r.name === "Kucharz");

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black dark:text-white">
            Zarządzanie Załogą
          </h2>
          <p className="text-gray-500 mt-1">
            {isManager
              ? "Dodawaj, edytuj i zwalniaj pracowników."
              : "Przeglądaj listę pracowników restauracji."}
          </p>
        </div>

        {isManager && (
          <button
            onClick={openAddModal}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition active:scale-95 shadow-lg shadow-purple-500/30"
          >
            <Plus size={20} /> Dodaj Pracownika
          </button>
        )}
      </div>

      {!isManager && (
        <div className="mb-6 bg-blue-50 dark:bg-slate-800 p-4 rounded-xl flex items-center gap-3 text-blue-600 dark:text-blue-400 font-bold">
          <AlertCircle size={20} />
          Tryb podglądu. Tylko Menedżer może edytować załogę.
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-bold">Pracownik</th>
                <th className="px-6 py-4 font-bold">Login</th>
                <th className="px-6 py-4 font-bold">Role</th>
                {isManager && (
                  <th className="px-6 py-4 font-bold text-right">Akcje</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {employees.map((emp) => (
                <tr
                  key={emp.employeeId}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {emp.name} {emp.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-sm">
                    @{emp.login}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(emp.roleNames || []).map((role) => (
                        <span
                          key={role}
                          className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>

                  {isManager && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-2 text-gray-400 hover:text-blue-500 bg-gray-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.employeeId)}
                          className="p-2 text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition"
                        >
                          <UserMinus size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {employees.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={isManager ? 4 : 3}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Brak pracowników do wyświetlenia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-xl font-black dark:text-white">
                {editingId ? "Edytuj Pracownika" : "Nowy Pracownik"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Imię
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none dark:text-white transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Nazwisko
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none dark:text-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Login
                </label>
                <input
                  type="text"
                  value={formData.login}
                  onChange={(e) =>
                    setFormData({ ...formData, login: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none dark:text-white transition"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  <Shield size={16} className="text-purple-500" /> Przypisz Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Available_Roles.map((role) => (
                    <label
                      key={role.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        formData.roleIds.includes(role.id)
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 font-bold"
                          : "border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.roleIds.includes(role.id)}
                        onChange={() => handleRoleToggle(role.id)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      {role.name}
                    </label>
                  ))}
                </div>
              </div>

              {isChefForm && (
                <div className="pt-4 border-t border-gray-100 dark:border-slate-700 animate-in fade-in duration-300">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Specjalizacja (Dania)
                  </label>
                  <select
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none dark:text-white transition"
                    onChange={(e) => {
                      const dishId = Number(e.target.value);
                      if (dishId && !selectedDishIds.includes(dishId)) {
                        setSelectedDishIds([...selectedDishIds, dishId]);
                      }
                      e.target.value = "";
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Wybierz danie z listy, by przypisać...
                    </option>
                    {(Array.isArray(allDishes) ? allDishes : [])
                      .filter((dish) => {
                        const id = dish?.dishId ?? (dish as any)?.DishId;
                        return id && !selectedDishIds.includes(id);
                      })
                      .map((dish) => {
                        const id = dish?.dishId ?? (dish as any)?.DishId;
                        const name = dish?.name ?? (dish as any)?.Name;
                        return (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        );
                      })}
                  </select>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedDishIds.map((id) => {
                      const dish = (
                        Array.isArray(allDishes) ? allDishes : []
                      ).find((d) => (d?.dishId ?? (d as any)?.DishId) === id);
                      const dishName =
                        dish?.name ?? (dish as any)?.Name ?? `Danie #${id}`;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                        >
                          {dishName}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedDishIds(
                                selectedDishIds.filter((dId) => dId !== id),
                              )
                            }
                            className="hover:text-red-500 transition focus:outline-none flex items-center justify-center"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      );
                    })}
                    {selectedDishIds.length === 0 && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                        Brak przypisanych specjalizacji.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800/50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                Anuluj
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 transition active:scale-95 shadow-md shadow-purple-500/20"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Crew;
