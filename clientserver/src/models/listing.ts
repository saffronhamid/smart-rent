import mongoose from "mongoose";

const ListingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },            // e.g., "1-Zimmer Wohnung, Innenstadt"
    city: { type: String, required: true, index: true },            // e.g., "Marburg"
    district: { type: String, default: "" },                        // e.g., "Weidenhausen"
    address: { type: String, default: "" },

    size_m2: { type: Number, required: true, min: 5 },              // living area
    rooms: { type: Number, default: 1 },
    furnished: { type: Boolean, default: false },

    rent_cold: { type: Number, required: true, min: 0 },            // Kaltmiete
    rent_warm: { type: Number, min: 0 },                            // Warmmiete (optional)

    source: { type: String, default: "manual" },                    // manual, csv, scrape
    url: { type: String, default: "" },
  },
  { timestamps: true }
);

// helpful compound index for filters
ListingSchema.index({ city: 1, district: 1, rent_cold: 1, size_m2: 1 });

export type ListingDoc = mongoose.InferSchemaType<typeof ListingSchema>;
export default mongoose.model<ListingDoc>("Listing", ListingSchema);
