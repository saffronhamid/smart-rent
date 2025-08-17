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

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

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

      // reset form
      setForm({
        title: "", city: "", district: "", address: "",
        size_m2: "", rooms: "1", furnished: false,
        rent_cold: "", rent_warm: "", url: "",
      });

      // tell parent (App) to refresh
      onCreated?.();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-lg shadow p-4 space-y-3">
      <h2 className="text-lg font-semibold">➕ Add Listing</h2>

      {err && <div className="text-red-600 text-sm">{err}</div>}

      <div className="grid md:grid-cols-2 gap-3">
        <input className="border rounded px-3 py-2" placeholder="Title"
          value={form.title} onChange={(e) => update("title", e.target.value)} required />
        <input className="border rounded px-3 py-2" placeholder="City"
          value={form.city} onChange={(e) => update("city", e.target.value)} required />
        <input className="border rounded px-3 py-2" placeholder="District"
          value={form.district} onChange={(e) => update("district", e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Address"
          value={form.address} onChange={(e) => update("address", e.target.value)} />
        <input type="number" className="border rounded px-3 py-2" placeholder="Size (m²)"
          value={form.size_m2} onChange={(e) => update("size_m2", e.target.value)} required />
        <input type="number" className="border rounded px-3 py-2" placeholder="Rooms"
          value={form.rooms} onChange={(e) => update("rooms", e.target.value)} />
        <input type="number" className="border rounded px-3 py-2" placeholder="Cold Rent (€)"
          value={form.rent_cold} onChange={(e) => update("rent_cold", e.target.value)} required />
        <input type="number" className="border rounded px-3 py-2" placeholder="Warm Rent (€)"
          value={form.rent_warm} onChange={(e) => update("rent_warm", e.target.value)} />
        <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Source URL"
          value={form.url} onChange={(e) => update("url", e.target.value)} />
      </div>

      <label className="inline-flex items-center gap-2">
        <input type="checkbox" checked={form.furnished}
          onChange={(e) => update("furnished", e.target.checked)} />
        Furnished
      </label>

      <button
        type="submit"
        disabled={saving}
        className="block bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Listing"}
      </button>
    </form>
  );
}
