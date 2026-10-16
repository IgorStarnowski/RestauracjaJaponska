import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordField from "../components/PasswordField";
import { API_BASE_URL } from '../config/api';


export default function Register() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    city: "",
    postalCode: "",
    street: "",
    buildingNumber: "",
    apartmentNumber: "",
  });
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleRegister = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Hasła nie są identyczne!");
      return;
    }

    const { confirmPassword, ...payload } = formData;

    try {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Błąd podczas rejestracji");
      }

      console.log("Konto założone pomyślnie!");
      setIsSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      console.error("Błąd rejestracji:", err);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Jem-to-dobre
          <span className="block text-sm text-blue-500 dark:text-blue-400 mt-2 font-normal">
            Rejestracja nowego konta
          </span>
        </h2>
        {isSuccess ? (
          <div className="text-center space-y-6 py-8">
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-500 text-green-700 dark:text-green-400 px-6 py-8 rounded-lg">
              <p className="font-bold text-2xl mb-2">Konto utworzone!</p>
              <p className="text-lg">Witamy w ekipie Jem-to-dobre.</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 animate-pulse">
              Za chwilę zostaniesz przekierowany do strony logowania...
            </p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="border-b border-gray-200 dark:border-slate-700 pb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">
                Dane podstawowe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Imię *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Nazwisko *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Nr telefonu *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <PasswordField
                    label="Hasło *"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    showStrength={true}
                    colorClass="blue"
                  />
                </div>
                <div className="md:col-span-2">
                  <PasswordField
                    label="Powtórz hasło *"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    colorClass="blue"
                  />
                </div>
              </div>
              {error && (
                <div className="w-full my-1 mt-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">
                Adres dostawy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Miejscowość *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Kod pocztowy *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    placeholder="00-000"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Ulica *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Nr budynku *
                  </label>
                  <input
                    type="text"
                    name="buildingNumber"
                    value={formData.buildingNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Nr lokalu
                  </label>
                  <input
                    type="text"
                    name="apartmentNumber"
                    value={formData.apartmentNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="pt-4 flex flex-col gap-3">
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                Utwórz konto
              </button>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                Wróć do logowania
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
