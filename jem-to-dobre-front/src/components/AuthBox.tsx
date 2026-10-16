import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordField from "./PasswordField";

interface LoginData {
  identifier: string;
  password: string;
}

interface AuthBoxProps {
  title: string;
  subTitle: string;
  type: "client" | "worker";
  onLogin: (data: LoginData) => void;
  colorClass: string;
}

export default function AuthBox({
  title,
  subTitle,
  type,
  onLogin,
  colorClass,
}: AuthBoxProps) {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [isRecovering, setIsRecovering] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onLogin({ identifier, password });
  };

  const handleRecovery = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Symulacja wysłania maila
    setRecoverySent(true);
    setTimeout(() => {
      setRecoverySent(false);
      setIsRecovering(false);
    }, 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-700">
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
        {title}
      </h2>
      <p
        className={`text-center text-sm mb-8 font-medium ${
          type === "worker" ? "text-green-500" : "text-blue-500"
        }`}
      >
        {isRecovering ? "Odzyskiwanie hasła" : subTitle}
      </p>

      {!isRecovering ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              {type === "client" ? "E-mail" : "Login pracownika"}
            </label>
            <input
              type={type === "client" ? "email" : "text"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className={`w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-${colorClass}-500 outline-none`}
            />
          </div>

          <PasswordField
            label="Hasło"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            colorClass={colorClass}
          />

          <button
            type="submit"
            className={`w-full bg-${colorClass}-500 hover:bg-${colorClass}-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-lg shadow-${colorClass}-500/20`}
          >
            Zaloguj się
          </button>

          {type === "client" && (
            <div className="flex items-center justify-between text-sm mt-4">
              <button
                type="button"
                onClick={() => setIsRecovering(true)}
                className="text-gray-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 transition"
              >
                Zapomniałeś hasła?
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-blue-600 font-bold hover:underline dark:text-blue-400"
              >
                Załóż konto
              </button>
            </div>
          )}
        </form>
      ) : (
        <div className="space-y-6">
          {recoverySent ? (
            <div className="text-center space-y-4 py-4">
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-500 text-green-700 dark:text-green-400 px-4 py-6 rounded-lg">
                <p className="font-bold text-lg mb-1">Link wysłany!</p>
                <p className="text-sm">Sprawdź swoją skrzynkę pocztową.</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 animate-pulse font-medium">
                Powrót do logowania...
              </p>
            </div>
          ) : (
            <form onSubmit={handleRecovery} className="space-y-6">
              <p className="text-sm text-gray-600 dark:text-slate-400 text-center">
                Wpisz adres e-mail, aby otrzymać link do resetowania hasła.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className={`w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-${colorClass}-500 outline-none`}
                />
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  className={`w-full bg-${colorClass}-500 hover:bg-${colorClass}-600 text-white font-bold py-3 px-4 rounded-lg transition`}
                >
                  Wyślij link
                </button>
                <button
                  type="button"
                  onClick={() => setIsRecovering(false)}
                  className="w-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                >
                  Anuluj
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
