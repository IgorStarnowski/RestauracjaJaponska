import {useNavigate} from "react-router-dom";
import AuthBox from "../components/AuthBox";
import {jwtDecode} from "jwt-decode";
import { API_BASE_URL } from '../config/api';


const LoginEmployees = () => {
  const navigate = useNavigate();

  const handleLogin = async (data: {
    identifier: string;
    password: string;
  }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/Auth/employee`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      if (response.ok) {
        const dataText = await response.text();

        let tokenToSave = dataText;
        try {
          const parsed = JSON.parse(dataText);
          tokenToSave = parsed.token || parsed;
        } catch {
          //a
        }

        tokenToSave = tokenToSave.replace(/^"|"$/g, "");
        localStorage.setItem("token", tokenToSave);

        let isCourier = false;

        try {
          const decoded: any = jwtDecode(tokenToSave);
          const rawRole =
            decoded.role ||
            decoded[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ];

          if (rawRole) {
            const roleString = Array.isArray(rawRole)
              ? rawRole.join(",")
              : rawRole;
            localStorage.setItem("role", roleString);

            if (
              roleString.includes("Dostawca") ||
              roleString.includes("Courier")
            ) {
              isCourier = true;
            }
          }
        } catch (e) {
          console.log("Błąd dekodowania tokena", e);
        }

        if (isCourier) {
          navigate("/courier");
        } else {
          navigate("/");
        }

        window.location.reload();
      } else {
        const errorText = await response.text();
        alert(
          `Błąd logowania!\nNiepoprawny login lub hasło.\nSzczegóły: ${errorText}`,
        );
      }
    } catch (error) {
      console.error("Błąd połączenia z API:", error);
      alert(
        "CRITICAL ERROR: Serwer nie odpowiada. Sprawdź, czy backend jest odpalony!",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <AuthBox
        title="Jem-to-dobre"
        subTitle="Panel pracownika"
        type="worker"
        colorClass="green"
        onLogin={handleLogin}
      />
    </div>
  );
};

export default LoginEmployees;
