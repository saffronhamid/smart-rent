import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return alert("Please enter a username");

    // Save to localStorage (simulate signup)
    localStorage.setItem("user", username.trim());
    navigate("/"); // Redirect to home
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded p-6 w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>

        <label className="block mb-2 text-gray-700">Username</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Create a username"
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default Signup;
