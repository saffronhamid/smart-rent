import { useEffect, useState } from "react";
import axios from "axios";
import AddListingForm from "./AddListingForm";
import CsvImport from "./CsvImport";
import Header from "./Header";

// Map (kept behind a toggle)
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./leafletFix";

interface Listing {
  _id: string;
  title: string;
  city: string;
  district?: string;
  size_m2: number;
  rooms: number;
  furnished: boolean;
  rent_cold: number;
  rent_warm?: number;
  lat?: number;
  lng?: number;
}

function App() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [city, setCity] = useState("");
  const [minRent, setMinRent] = useState<string>("");
  const [maxRent, setMaxRent] = useState<string>("");
  const [showMap, setShowMap] = useState(false);

  const fetchListings = async () => {
    const params: Record<string, string> = {};
    if (city) params.city = city;
    if (minRent) params.minRent = minRent;
    if (maxRent) params.maxRent = maxRent;

    const res = await axios.get(`${import.meta.env.VITE_API_BASE}/api/listings`, { params });

    // TEMP coords so markers can render if map is shown
    const withCoords = (res.data as Listing[]).map((l) => ({
      ...l,
      lat: 50.807 + Math.random() * 0.02 - 0.01,
      lng: 8.77 + Math.random() * 0.02 - 0.01,
    }));

    setListings(withCoords);
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived stats
  const total = listings.length;
  const avgRent =
    total > 0
      ? (listings.reduce((s, l) => s + (Number(l.rent_cold) || 0), 0) / total).toFixed(0)
      : "-";
  const avgSize =
    total > 0
      ? (listings.reduce((s, l) => s + (Number(l.size_m2) || 0), 0) / total).toFixed(0)
      : "-";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* CSV Import */}
        <div>
          <CsvImport onImported={fetchListings} />
        </div>

        {/* Add Listing Form */}
        <div>
          <AddListingForm onCreated={fetchListings} />
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-3 items-end">
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

        {/* Stats + Sorting */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-6 items-center">
          <div>
            <p className="text-gray-600">Total Listings</p>
            <p className="font-bold">{total}</p>
          </div>
          <div>
            <p className="text-gray-600">Avg Cold Rent (€)</p>
            <p className="font-bold">{avgRent}</p>
          </div>
          <div>
            <p className="text-gray-600">Avg Size (m²)</p>
            <p className="font-bold">{avgSize}</p>
          </div>

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setListings([...listings].sort((a, b) => a.rent_cold - b.rent_cold))}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              Sort by Rent
            </button>
            <button
              onClick={() => setListings([...listings].sort((a, b) => a.size_m2 - b.size_m2))}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              Sort by Size
            </button>
            <button
              onClick={() => setShowMap((s) => !s)}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              {showMap ? "Hide Map" : "Show Map"}
            </button>
          </div>
        </div>

        {/* Map View (optional) */}
        {showMap && (
          <div>
            <MapContainer
              center={[50.807, 8.77]}
              zoom={13}
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {listings.map(
                (l) =>
                  l.lat &&
                  l.lng && (
                    <Marker key={l._id} position={[l.lat, l.lng]}>
                      <Popup>
                        <strong>{l.title}</strong>
                        <br />
                        {l.city} {l.district && `(${l.district})`}
                        <br />💶 {l.rent_cold} €
                      </Popup>
                    </Marker>
                  )
              )}
            </MapContainer>
          </div>
        )}

        {/* Results */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <div key={l._id} className="bg-white rounded-xl shadow-md p-4">
              <h2 className="text-xl font-semibold">{l.title}</h2>
              <p className="text-gray-600">
                {l.city}
                {l.district && `, ${l.district}`}
              </p>
              <p className="mt-2">📏 {l.size_m2} m² — 🛏 {l.rooms} rooms</p>
              <p>💶 Cold Rent: {l.rent_cold} €</p>
              {l.rent_warm && <p>🔥 Warm Rent: {l.rent_warm} €</p>}
              <p>{l.furnished ? "🪑 Furnished" : "🚪 Unfurnished"}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
