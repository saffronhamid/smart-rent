// backend/routes/users.ts or wherever your user routes are
import express from "express";
import upload from "../utils/multerConfig";
import User from "../models/User";
import authMiddleware from "../middleware/auth"; // Assumes JWT middleware

const router = express.Router();

// Upload verification docs
router.post(
  "/upload-documents",
  authMiddleware,
  upload.array("documents", 5), // max 5 files
  async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.role !== "landlord") {
        return res.status(403).json({ message: "Only landlords can upload documents" });
      }

      const uploadedFiles = req.files as Express.Multer.File[];
      const filePaths = uploadedFiles.map((f) => f.path);

      user.documents.push(...filePaths);
      user.isVerified = false; // Always false until manually approved
      await user.save();

      res.json({ message: "Documents uploaded", files: filePaths });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

export default router;
