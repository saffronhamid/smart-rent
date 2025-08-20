import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Header from "./Header"; // Keep Header outside routes

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Header remains consistent across all pages */}
      <Header />

      {/* ✅ Define all routes here */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
  );
}

export default App;
