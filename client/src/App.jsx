import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ArticleList from "./pages/ArticleList";
import ArticleReader from "./pages/ArticleReader";
import Highlights from "./pages/Highlights";
import Notes from "./pages/Notes";
import Navbar from "./components/Navbar";

function AppContent() {
  const location = useLocation();
  const showNavbar =
    location.pathname !== "/login" && location.pathname !== "/register";

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/articles" element={<ArticleList />} />
        <Route path="/article/:id" element={<ArticleReader />} />
        <Route path="/highlights" element={<Highlights />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
