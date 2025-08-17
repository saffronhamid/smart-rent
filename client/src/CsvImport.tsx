import Papa from "papaparse";
import axios from "axios";
import { useState } from "react";

export default function CsvImport({ onImported }: { onImported?: () => void }) {
  const [msg, setMsg] = useState<string>("");

  const handleFile = (file: File) => {
    setMsg("Parsing CSV...");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as any[];
          if (!rows.length) {
            setMsg("No rows found.");
            return;
          }
          // send to backend
          const res = await axios.post(
            `${import.meta.env.VITE_API_BASE}/api/listings/bulk`,
            rows
          );
          setMsg(`Imported ${res.data.inserted} listings ✅`);
          onImported?.();
        } catch (err: any) {
          setMsg(err?.response?.data?.error || "Import failed");
        }
      },
      error: () => setMsg("Failed to parse CSV"),
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-semibold mb-2">📂 Import from CSV</h2>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {msg && <p className="text-sm mt-2">{msg}</p>}
      <p className="text-xs text-gray-500 mt-2">
        Columns supported: title, city, district, address, size_m2, rooms, furnished, rent_cold, rent_warm, url
      </p>
    </div>
  );
}
