import { jwtDecode } from "jwt-decode";
import {
  AlertCircle,
  ChevronRight,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings,
  Shield,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { API_BASE_URL } from '../config/api';


interface DecodedToken {
  nameid: string;
  unique_name: string;
  role: string | string[];
  exp: number;
  nbf: number;
  iat: number;
}

interface UserProfile {
  id: number;
  isEmployee: boolean;
  firstName: string;
  lastName: string;
  emailOrLogin: string;
  phone?: string;
  roleNames?: string[];
  address?: {
    addressId: number;
    street: string;
    buildingNumber: string;
    apartmentNumber?: string | null;
    city: string;
    postalCode: string;
  } | null;
}

interface OrderItem {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  totalPrice: number;
  status: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  });

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status ? status.toUpperCase() : "";

    const badges: Record<string, { label: string; colors: string }> = {
      NOWE: { label: "Nowe", colors: "bg-yellow-50 text-yellow-600" },
      WPRZYGOTOWANIU: {
        label: "W przygotowaniu",
        colors: "bg-blue-50 text-blue-600",
      },
      GOTOWE: { label: "Gotowe", colors: "bg-purple-50 text-purple-600" },
      WDOSTAWIE: { label: "W dostawie", colors: "bg-green-50 text-green-600" },
      ZAKONCZONE: { label: "Zakończone", colors: "bg-red-50 text-red-600" },
      ANULOWANE: { label: "Anulowane", colors: "bg-red-50 text-red-600" },
    };

    const config = badges[normalizedStatus] || {
      label: `Nieznany (${status})`,
      colors: "bg-gray-50 text-gray-600",
    };

    return (
      <span
        className={`px-2 py-1 rounded-md text-xs font-bold ${config.colors}`}
      >
        {config.label}
      </span>
    );
  };

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const storedRole = localStorage.getItem("role") || "Client";
      const isEmployee = storedRole !== "Client" && storedRole !== "Guest";

      if (!token) {
        navigate("/login");
        return;
      }

      let decoded: DecodedToken;
      try {
        decoded = jwtDecode<DecodedToken>(token);
      } catch (decodeError) {
        handleLogout();
        return;
      }

      const emailOrLoginFromToken = decoded.unique_name;

      if (isEmployee) {
        const empResponse = await fetch(
          `${API_BASE_URL}/Employees/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!empResponse.ok)
          throw new Error(`Błąd serwera: ${empResponse.status}`);
        const empData = await empResponse.json();

        setUser({
          id: empData.employeeId,
          isEmployee: true,
          firstName: empData.name,
          lastName: empData.lastName,
          emailOrLogin: empData.login,
          roleNames: empData.roleNames,
        });
      } else {
        const clientResponse = await fetch(
          `${API_BASE_URL}/Clients/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!clientResponse.ok) {
          if (clientResponse.status === 401) {
            handleLogout();
            return;
          }
          throw new Error(`Błąd serwera: ${clientResponse.status}`);
        }

        const clientData = await clientResponse.json();

        const addressResponse = await fetch(
          `${API_BASE_URL}/Clients/me/addresses`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        let addressData = null;
        if (addressResponse.ok) {
          const addresses = await addressResponse.json();
          if (addresses.length > 0) addressData = addresses[0];
        }

        const ordersResponse = await fetch(
          `${API_BASE_URL}/Orders/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData);
        }

        setUser({
          id: clientData.clientId,
          isEmployee: false,
          firstName: clientData.name,
          lastName: clientData.lastName,
          emailOrLogin: emailOrLoginFromToken,
          phone: clientData.phoneNumber,
          address: addressData,
        });
      }
    } catch (err: unknown) {
      console.error("Błąd pobierania profilu:", err);
      setError(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [navigate]);

  const handleEditToggle = () => {
    if (!user) return;
    setEditForm({
      name: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phone || "",
      email: user.emailOrLogin,
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      setIsSaving(true);
      setError(null);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/Clients/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Błąd zapisu: ${errText}`);
      }

      setIsEditing(false);
      await fetchProfileData();
    } catch (err: unknown) {
      console.error("Błąd zapisu:", err);
      setError(
        err instanceof Error ? err.message : "Nie udało się zapisać zmian.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    clearCart();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center py-20 transition-colors duration-300">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-bold">
          Wczytywanie Twojego profilu...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 pt-6 flex justify-between items-center">
        <button
          onClick={() => navigate("/")}
          className="text-sm font-black text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1 transition active:scale-95"
        >
          ← Powrót na stronę główną
        </button>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm font-bold bg-red-50 dark:bg-red-950/20 px-3 py-1.5 rounded-xl animate-bounce">
            <AlertCircle size={18} /> {error}
          </div>
        )}
      </div>

      {user && (
        <main className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#1a2233] p-6 rounded-2xl shadow-md border border-gray-100 dark:border-slate-800 flex flex-col items-center text-center transition-colors duration-300">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 border-2 shadow-sm ${user.isEmployee ? "bg-purple-100 text-purple-600 border-purple-200 dark:bg-slate-700 dark:border-slate-600" : "bg-orange-100 text-orange-600 border-orange-200 dark:bg-slate-700 dark:border-slate-600"}`}
              >
                {user.isEmployee ? <Shield size={44} /> : <User size={44} />}
              </div>

              <h2 className="text-xl font-black dark:text-white">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                {user.isEmployee
                  ? "Pracownik Restauracji"
                  : "Klient JemToDobre"}
              </p>

              <div className="w-full space-y-2">
                {!user.isEmployee &&
                  (!isEditing ? (
                    <button
                      onClick={handleEditToggle}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-black py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 active:scale-95"
                    >
                      <Settings size={16} /> Edytuj Profil
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-black py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Save size={16} />
                        )}
                        Zapisz zmiany
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-black py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 active:scale-95"
                      >
                        <X size={16} /> Anuluj
                      </button>
                    </>
                  ))}

                <button
                  onClick={handleLogout}
                  className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 text-sm font-black py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <LogOut size={16} /> Wyloguj się
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#1a2233] p-6 rounded-2xl shadow-md border border-gray-100 dark:border-slate-800 transition-colors duration-300">
              <h3 className="text-lg font-black dark:text-white mb-4">
                Informacje o koncie
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isEditing && !user.isEmployee ? (
                  <>
                    <div className="sm:col-span-1">
                      <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block mb-1">
                        Imię
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-sm dark:text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block mb-1">
                        Nazwisko
                      </label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) =>
                          setEditForm({ ...editForm, lastName: e.target.value })
                        }
                        className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-sm dark:text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-sm dark:text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block mb-1">
                        Telefon
                      </label>
                      <input
                        type="text"
                        value={editForm.phoneNumber}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-sm dark:text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl sm:col-span-2">
                      <Mail
                        className="text-gray-400 dark:text-gray-500"
                        size={20}
                      />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                          {user.isEmployee ? "Login Systemowy" : "Adres Email"}
                        </p>
                        <p className="text-sm font-bold dark:text-white truncate max-w-[200px]">
                          {user.emailOrLogin}
                        </p>
                      </div>
                    </div>

                    {!user.isEmployee && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl sm:col-span-2">
                        <Phone
                          className="text-gray-400 dark:text-gray-500"
                          size={20}
                        />
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                            Numer Telefonu
                          </p>
                          <p className="text-sm font-bold dark:text-white">
                            {user.phone}
                          </p>
                        </div>
                      </div>
                    )}

                    {user.isEmployee && user.roleNames && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl sm:col-span-2">
                        <Shield
                          className="text-gray-400 dark:text-gray-500"
                          size={20}
                        />
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                            Przypisane uprawnienia (Role)
                          </p>
                          <div className="flex gap-2 mt-1">
                            {user.roleNames.map((role) => (
                              <span
                                key={role}
                                className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md text-xs font-bold"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {!user.isEmployee && !isEditing && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl sm:col-span-2 mt-2">
                    <MapPin
                      className="text-gray-400 dark:text-gray-500"
                      size={20}
                    />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                        Domyślny adres dostawy
                      </p>
                      <p className="text-sm font-bold dark:text-white">
                        {user.address
                          ? `${user.address.street} ${user.address.buildingNumber}${user.address.apartmentNumber ? `/${user.address.apartmentNumber}` : ""}, ${user.address.postalCode} ${user.address.city}`
                          : "Brak zdefiniowanego adresu"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!user.isEmployee && (
              <div className="bg-white dark:bg-[#1a2233] p-6 rounded-2xl shadow-md border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                <h3 className="text-lg font-black dark:text-white mb-4 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-blue-500" /> Moje
                  ostatnie zamówienia
                </h3>

                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                  {orders.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center">
                      Brak zamówień w historii.
                    </p>
                  ) : (
                    orders.map((order) => (
                      <div
                        key={order.orderId}
                        className="py-4 flex items-center justify-between group cursor-pointer first:pt-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-slate-800/30 rounded-lg px-2 -mx-2 transition-colors"
                      >
                        <div>
                          <p className="font-black dark:text-white text-sm group-hover:text-blue-500 transition-colors">
                            #{order.orderNumber}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {new Date(order.orderDate).toLocaleDateString()}{" "}
                            {new Date(order.orderDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right flex flex-col items-end">
                            <p className="font-black dark:text-white text-sm mb-1">
                              {order.totalPrice.toFixed(2)} zł
                            </p>
                            {getStatusBadge(order.status)}
                          </div>
                          <ChevronRight
                            size={16}
                            className="text-gray-400 group-hover:translate-x-1 transition-transform"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
};

export default Profile;
