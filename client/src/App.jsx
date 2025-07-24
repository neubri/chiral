import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import GuestLayout from "./layouts/GuestLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ArticleList from "./pages/ArticleList";
import ArticleReader from "./pages/ArticleReader";
import Highlights from "./pages/Highlights";
import Notes from "./pages/Notes";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Guest Routes */}
        <Route element={<GuestLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Public Routes with Main Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/articles" element={<ArticleList />} />
          <Route path="/article/:id" element={<ArticleReader />} />
        </Route>

        {/* Authenticated Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/highlights" element={<Highlights />} />
          <Route path="/notes" element={<Notes />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
