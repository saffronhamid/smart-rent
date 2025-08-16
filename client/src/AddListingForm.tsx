import { useState } from "react";
import axios from "axios";

type Props = { onCreated?: () => void };

export default function AddListingForm({ onCreated }: Props) {
  const [form, setForm] = useState({
    title: "",
    city: "",
    district: "",
    address: "",
    size_m2: "",
    rooms: "1",
    furnished: false,
    rent_cold: "",
    rent_warm: "",
    url: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const update = (k: string, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE}/api/listings`, {
        title: form.title,
        city: form.city,
        district: form.district || undefined,
        address: form.address || undefined,
        size_m2: Number(form.size_m2),
        rooms: Number(form.rooms),
        furnished: Boolean(form.furnished),
        rent_cold: Number(form.rent_cold),
        rent_warm: form.rent_warm ? Number(form.rent_warm) : undefined,
        source: "manual",
        url: form.url || undefined,
      });
      setForm({
        title: "", city: "", district: "", address: "",
        size_m2: "", rooms: "1", furnished: false,
        rent_cold: "", rent_warm: "", url: "",
      });
      onCreated?.();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

 return (
  <div className="p-6 bg-gray-100 min-h-screen">
    <h1 className="text-3xl font-bold mb-4 text-center">🏠 Smart Rent Listings</h1>

    {/* Add Listing */}
    <div className="mb-6">
      <AddListingForm onCreated={fetchListings} />
    </div>

    {/* Filter Bar */}
    <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-sm text-gray-600">City</label>
        <input
          className="border rounded px-3 py-2"
          placeholder="Marburg"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">Min Rent (€)</label>
        <input
          type="number"
          className="border rounded px-3 py-2"
          placeholder="400"
          value={minRent}
          onChange={(e) => setMinRent(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">Max Rent (€)</label>
        <input
          type="number"
          className="border rounded px-3 py-2"
          placeholder="800"
          value={maxRent}
          onChange={(e) => setMaxRent(e.target.value)}
        />
      </div>
      <button
        onClick={fetchListings}
        className="ml-auto bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
      >
        Apply Filters
      </button>
    </div>

    {/* Results */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <div key={listing._id} className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold">{listing.title}</h2>
          <p className="text-gray-600">
            {listing.city}{listing.district && `, ${listing.district}`}
          </p>
          <p className="mt-2">📏 {listing.size_m2} m² — 🛏 {listing.rooms} rooms</p>
          <p>💶 Cold Rent: {listing.rent_cold} €</p>
          {listing.rent_warm && <p>🔥 Warm Rent: {listing.rent_warm} €</p>}
          <p>{listing.furnished ? "🪑 Furnished" : "🚪 Unfurnished"}</p>
        </div>
      ))}
    </div>
  </div>
);
}