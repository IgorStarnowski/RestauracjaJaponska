import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginClients";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import ThemeToggle from "./components/ThemeToggle";
import LoginEmployees from "./pages/LoginEmployees";
import Crew from "./pages/Crew";
import { CartProvider } from "./context/CartContext";
import Profile from "./pages/Profile";
import DishDetails from "./pages/DishDetails";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import CourierPanel from "./pages/CourierPanel";
import ChefPanel from "./pages/ChefPanel";
import Reports from "./pages/Reports";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="relative">
          <div className="fixed bottom-6 right-6 z-[100] bg-white dark:bg-slate-800 rounded-full shadow-xl border border-gray-200 dark:border-slate-700">
            <ThemeToggle />
          </div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/login-employees" element={<LoginEmployees />} />
            <Route path="/crew" element={<Crew />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dish/:id" element={<DishDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/courier" element={<CourierPanel />} />
            <Route path="/kitchen" element={<ChefPanel />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}
export default App;
