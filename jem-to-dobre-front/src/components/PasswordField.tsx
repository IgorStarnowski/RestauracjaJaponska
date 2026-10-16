import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  showStrength?: boolean;
  colorClass?: string;
}
const getPasswordStrength = (password: string) => {
  if (!password) return { score: 0, label: "", color: "bg-gray-200" };
  if (password.length < 6)
    return { score: 1, label: "Za krótkie", color: "bg-red-500" };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score < 2) return { score: 2, label: "Słabe", color: "bg-orange-500" };
  if (score < 4) return { score: 3, label: "Średnie", color: "bg-yellow-500" };
  return { score: 4, label: "Silne", color: "bg-green-500" };
};

export default function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  showStrength = false,
  colorClass = "blue",
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const strength = getPasswordStrength(value);
  const getRingColor = () => {
    switch (colorClass) {
      case "green":
        return "focus:ring-green-500 focus:border-green-500";
      case "yellow":
        return "focus:ring-yellow-500 focus:border-yellow-500";
      default:
        return "focus:ring-blue-500 focus:border-blue-500";
    }
  };
  const focusRingColor = getRingColor();
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white outline-none focus:ring-2 transition ${focusRingColor} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {showStrength && value.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-1 h-1">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-full w-full rounded-full transition-colors duration-300 ${
                  step <= strength.score
                    ? strength.color
                    : "bg-gray-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>
          <p
            className={`text-[12px] mt-1 font-bold transition-colors duration-300 ${
              strength.score === 1
                ? "text-red-500 dark:text-red-400"
                : strength.score === 2
                  ? "text-orange-500 dark:text-orange-400"
                  : strength.score === 3
                    ? "text-yellow-500 dark:text-yellow-400"
                    : "text-green-500 dark:text-green-400"
            }`}
          >
            {strength.label}
          </p>
        </div>
      )}
    </div>
  );
}
