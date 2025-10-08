import React, { useState, useEffect } from "react";
import axios from "axios";
import { Save, X } from "lucide-react";

const Profiles = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    divisi: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);

  // Fetch profile user dari backend
  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/users/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
      });

      setFormData({
        name: res.data.name,
        email: res.data.email,
        password: "",
        divisi: res.data.divisi || "",
        role: res.data.role,
      });
      setLoading(false);
    } catch (err) {
      console.error("Fetch profile error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Update profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:3000/api/users/me", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
      });
      alert("Profile updated successfully!");
      fetchProfile();
    } catch (err) {
      console.error("Update profile error:", err);
      alert("Gagal update profile!");
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-300">Loading profile...</div>;
  }

  return (
  <div className="min-h-screen bg-gray-900 flex justify-center items-center text-gray-200">
    <div className="bg-gray-800/90 rounded-2xl shadow-2xl p-8 w-full max-w-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
        My Profile
      </h1>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nama"
          className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="Email"
          className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 text-gray-400"
          disabled
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password (kosongkan jika tidak diubah)"
          className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <input
          type="text"
          name="divisi"
          value={formData.divisi}
          onChange={handleChange}
          placeholder="Divisi"
          className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <input
          type="text"
          name="role"
          value={formData.role}
          className="w-full px-4 py-3 bg-gray-600 rounded-lg border border-gray-500 text-gray-400"
          disabled
        />

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={fetchProfile}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition"
          >
            <X size={16} /> Reset
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition"
          >
            <Save size={16} /> Update
          </button>
        </div>
      </form>
    </div>
  </div>
);
};

export default Profiles;
