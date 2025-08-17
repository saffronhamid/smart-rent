import { useEffect, useState } from "react";
import axios from "axios";
import AddListingForm from "./AddListingForm";
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
  // add optional coords
  lat?: number;
  lng?: number;
}

function App() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [city, setCity] = useState("");
  const [minRent, setMinRent] = useState<string>("");
  const [maxRent, setMaxRent] = useState<string>("");

  const fetchListings = async () => {
    const params: Record<string, string> = {};
    if (city) params.city = city;
    if (minRent) params.minRent = minRent;
    if (maxRent) params.maxRent = maxRent;

    const res = await axios.get(`${import.meta.env.VITE_API_BASE}/api/listings`, { params });
    // mock coordinates for demo (Marburg area)
    const withCoords = res.data.map((l: Listing, i: number) => ({
      ...l,
      lat: 50.807 + Math.random() * 0.02 - 0.01, // random nearby coords
      lng: 8.77 + Math.random() * 0.02 - 0.01,
    }));
    setListings(withCoords);
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center">🏠 Smart Rent Listings</h1>

      {/* Add Listing Form */}
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

      {/* Map View */}
      <div className="h-96 mb-6">
        <MapContainer center={[50.807, 8.77]} zoom={13} className="h-full w-full rounded-lg shadow">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {listings.map((listing) =>
            listing.lat && listing.lng ? (
              <Marker key={listing._id} position={[listing.lat, listing.lng]}>
                <Popup>
                  <strong>{listing.title}</strong> <br />
                  {listing.city} {listing.district && `(${listing.district})`} <br />
                  💶 {listing.rent_cold} €
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>

      {/* Results */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <div key={listing._id} className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold">{listing.title}</h2>
            <p className="text-gray-600">
              {listing.city}
              {listing.district && `, ${listing.district}`}
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

export default App;
