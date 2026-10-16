import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordField from "../components/PasswordField";
export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const handleReset = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków");
      return;
    }
    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne");
      return;
    }
    setError("");
    console.log("Wysyłam hasło do backendu");
    setSuccess(true);
    setTimeout(() => {
      navigate("/login");
    }, 3000);
  };
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-700 transition-all duration-300">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Jem-to-dobre
          <span className="block text-sm text-yellow-600 dark:text-yellow-500 mt-2 font-normal">
            Nowe hasło
          </span>
        </h2>
        {success ? (
          <div className="text-center space-y-4">
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-500 text-green-700 dark:text-green-400 px-4 py-4 rounded-lg">
              <p className="font-bold text-lg mb-1">Hasło zostało zmienione.</p>
              <p className="text-sm">Możesz się zalogować.</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 animate-pulse">
              Za chwilę zostaniesz przekierowany do strony logowania...
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <div>
              <PasswordField
                label="Nowe Hasło"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nowe hasło"
                required
                showStrength={true}
                colorClass="yellow"
              />
            </div>
            <div>
              <PasswordField
                label="Powtórz nowe hasło"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Powtórz hasło"
                required
                colorClass="yellow"
              />
            </div>
            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                Zapisz nowe hasło
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
