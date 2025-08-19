import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Custom type for request with user
interface AuthenticatedRequest extends Request {
  user?: { id: string; role: "user" | "landlord" };
}

// Middleware: Verify JWT token
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  const token = authHeader?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied. No token." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: "user" | "landlord" };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}

// Middleware: Check if user is landlord
export function requireLandlord(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "landlord") {
    return res.status(403).json({ error: "Landlord access required." });
  }
  next();
}
