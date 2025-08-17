import { Router } from "express";
import Listing from "../models/listing";

const router = Router();

/** GET /api/listings  (with optional filters) */
router.get("/", async (req, res) => {
  try {
    const {
      city,
      minRent,
      maxRent,
      minSize,
      maxSize,
      furnished,
      q,
    } = req.query as Record<string, string>;

    const filter: any = {};
    if (city) filter.city = city;
    if (minRent || maxRent) filter.rent_cold = {};
    if (minRent) filter.rent_cold.$gte = Number(minRent);
    if (maxRent) filter.rent_cold.$lte = Number(maxRent);
    if (minSize || maxSize) filter.size_m2 = {};
    if (minSize) filter.size_m2.$gte = Number(minSize);
    if (maxSize) filter.size_m2.$lte = Number(maxSize);
    if (typeof furnished !== "undefined")
      filter.furnished = furnished === "true";
    if (q) filter.title = { $regex: q, $options: "i" };

    const items = await Listing.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

/** POST /api/listings  (create one) */
router.post("/", async (req, res) => {
  try {
    const body = req.body || {};
    // very light checks
    if (!body.title || !body.city || body.size_m2 == null || body.rent_cold == null) {
      return res.status(400).json({ error: "title, city, size_m2, rent_cold are required" });
    }

    const doc = await Listing.create({
      title: String(body.title),
      city: String(body.city),
      district: body.district ?? "",
      address: body.address ?? "",
      size_m2: Number(body.size_m2),
      rooms: Number(body.rooms ?? 1),
      furnished: Boolean(body.furnished ?? false),
      rent_cold: Number(body.rent_cold),
      rent_warm: body.rent_warm != null ? Number(body.rent_warm) : undefined,
      source: body.source ?? "manual",
      url: body.url ?? "",
    });

    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ error: "Failed to create listing" });
  }
});/** POST /api/listings/bulk  (create many at once) */
router.post("/bulk", async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [];
    if (!items.length) return res.status(400).json({ error: "Expected an array of listings" });

    // Normalize and light-validate each row
    const docs = items.map((b: any) => ({
      title: String(b.title),
      city: String(b.city),
      district: b.district ?? "",
      address: b.address ?? "",
      size_m2: Number(b.size_m2),
      rooms: Number(b.rooms ?? 1),
      furnished: Boolean(b.furnished ?? false),
      rent_cold: Number(b.rent_cold),
      rent_warm: b.rent_warm != null ? Number(b.rent_warm) : undefined,
      source: b.source ?? "csv",
      url: b.url ?? "",
    }));

    // Basic required fields check
    for (const d of docs) {
      if (!d.title || !d.city || isNaN(d.size_m2) || isNaN(d.rent_cold)) {
        return res.status(400).json({ error: "Each item needs title, city, size_m2, rent_cold" });
      }
    }

    const result = await Listing.insertMany(docs, { ordered: false });
    res.status(201).json({ inserted: result.length });
  } catch (e: any) {
    res.status(500).json({ error: "Bulk insert failed" });
  }
});


module.exports = router;
