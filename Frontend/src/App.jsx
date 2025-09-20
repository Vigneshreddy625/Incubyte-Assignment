import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppProvider } from "./contexts/AppProvider.jsx";
import Login from "./components/Authentication/Login.jsx";
import Signup from "./components/Authentication/Signup.jsx";
import Dashboard from "./components/Shop.jsx";
import AdminPage from "./components/AdminPage.jsx";
import UserOrders from "./components/UserOrders.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import "./App.css";
import Layout from "./components/Layout/Layout.jsx";
import Home from "./components/Home.jsx";

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="shop" element={<Dashboard />} />
            <Route path="orders" element={<UserOrders />} />
          </Route>
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
