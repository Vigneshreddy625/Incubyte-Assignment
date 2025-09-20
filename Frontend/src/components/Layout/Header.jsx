import { Home, Shield, LogOut, ShoppingBag, Package, Menu, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isShop = location.pathname.startsWith("/shop");
  const isHome = location.pathname === "/home" || location.pathname === "/";

  const headerClass = isShop
    ? "bg-white sticky top-0 z-50 border-b border-gray-200 text-black"
    : isHome
    ? "bg-transparent fixed w-full top-0 z-50 text-white"
    : "bg-white sticky top-0 z-50 border-b border-gray-200 text-black";

  const navLinkClass = isShop
    ? "flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"
    : isHome
    ? "flex items-center gap-2 text-white hover:text-blue-200 font-medium transition"
    : "flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition";

  const titleClass = isShop
    ? "text-xl font-bold text-gray-900 group-hover:text-blue-700 transition"
    : isHome
    ? "text-xl font-bold text-white group-hover:text-blue-200 transition"
    : "text-xl font-bold text-gray-900 group-hover:text-blue-700 transition";

  return (
    <header className={headerClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <h1 className={titleClass}>Vsweets</h1>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {isHome && (
              <Link to="/shop" className={navLinkClass}>
                Shop
              </Link>
            )}
            <Link to="/orders" className={navLinkClass}>
              <Package className="w-4 h-4" />
              Orders
            </Link>
            <Link to="/admin" className={navLinkClass}>
              Admin
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </nav>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 pt-4 pb-6 space-y-3 flex flex-col">
            {isHome && (
              <Link
                to="/shop"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"
                onClick={() => setMenuOpen(false)}
              >
                Shop
              </Link>
            )}
            <Link
              to="/orders"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"
              onClick={() => setMenuOpen(false)}
            >
              Orders
            </Link>
            <Link
              to="/admin"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"
              onClick={() => setMenuOpen(false)}
            >
              Admin
            </Link>
            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
