import { Router } from "express";
import Listing from "../models/listing";

// 🛡️ Import JWT auth middleware
import { authenticateToken, requireLandlord } from "../middleware/authMiddleware";

const router = Router();

/**
 * GET /api/listings  🔓 Public
 * Optional filters (city, rent range, size range, furnished, keyword search)
 */
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
    if (typeof furnished !== "undefined") filter.furnished = furnished === "true";
    if (q) filter.title = { $regex: q, $options: "i" };

    const items = await Listing.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

/**
 * POST /api/listings  🔐 Protected (Landlords only)
 * Add a single new listing
 */
router.post("/", authenticateToken, requireLandlord, async (req, res) => {
  try {
    const body = req.body || {};

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
});

/**
 * POST /api/listings/bulk  🔐 Protected (Landlords only)
 * Import listings in bulk (CSV)
 */
router.post("/bulk", authenticateToken, requireLandlord, async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [];
    if (!items.length) return res.status(400).json({ error: "Expected an array of listings" });

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

/**
 * DELETE /api/listings/:id  🔐 Protected (Landlords only)
 * Delete a listing by ID
 */
router.delete("/:id", authenticateToken, requireLandlord, async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Listing.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({ message: "Listing deleted successfully", id });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

module.exports = router;
