import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ArticleList from "./pages/ArticleList";
import ArticleReader from "./pages/ArticleReader";
import Highlights from "./pages/Highlights";
import Notes from "./pages/Notes";
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

function AppContent() {
  const location = useLocation();
  const showNavbar =
    location.pathname !== "/login" &&
    location.pathname !== "/register" &&
    location.pathname !== "/";

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/articles" element={<ArticleList />} />
        <Route path="/article/:id" element={<ArticleReader />} />
        <Route
          path="/highlights"
          element={
            <ProtectedRoute>
              <Highlights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
