import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthBox from "../components/AuthBox";
import { API_BASE_URL } from '../config/api';

const LoginClients = () => {
  const navigate = useNavigate(); 
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data: { identifier: string; password: string }) => {
    console.log("Logowanie klienta - dane dla API:", data);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/client`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Błąd logowania. Sprawdź podane dane.");
      }

      const result = await response.json();
      console.log("Zalogowano pomyślnie:", result);

      if (result.token) {
        localStorage.setItem("token", result.token);
      } else {
        console.warn("Backend nie zwrócił tokenu w polu 'token'. Sprawdź strukturę obiektu result.");
      }
      
      navigate("/");

    } catch (err: any) {
      console.error("Błąd podczas logowania:", err);
      setError(err.message || "Wystąpił problem z połączeniem z serwerem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {isLoading && (
          <div className="mb-4 text-center text-blue-600 dark:text-blue-400 text-sm font-semibold">
            Trwa logowanie...
          </div>
        )}
      </div>

      <AuthBox
        title="Jem-to-dobre"
        subTitle="Panel klienta"
        type="client"
        colorClass="blue"
        onLogin={handleLogin}
      />
    </div>
  );
};

export default LoginClients;