import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";

const AppRoutes = () => {
  function checkToken() {
    return document.cookie
      .split(";")
      .some((cookie) => cookie.trim().startsWith("token="));
  }
  const isAuthenticated = checkToken();

  return (
    <BrowserRouter>
      <Routes>
        {isAuthenticated ? (
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/api/auth/register" element={<Register />} />
          </Routes>
        )}
        <Route path="/api/auth/register" element={<Register />} />
        <Route path="/api/auth/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
