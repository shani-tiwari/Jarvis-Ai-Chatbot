import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { Navigate } from "react-router-dom";

const AppRoutes = () => {
  function checkToken() {
    return document.cookie
      .split(";")
      .some((cookie) => cookie.trim().startsWith("token="));
  }
  const isAuthenticated = checkToken();

  function PrivateRoute({ children, isAuthenticated }) {
    return isAuthenticated ? (
      children
    ) : (
      <Navigate to="/api/auth/register" replace />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Home />
            </PrivateRoute>
          }
        />
        <Route path="/api/auth/register" element={<Register />} />
        <Route path="/api/auth/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
