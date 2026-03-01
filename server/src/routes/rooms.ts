import { Router } from "express";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { authenticateToken } from "../middleware/auth.js";
import prisma from "../prisma.js";
import { error } from "node:console";

const router = Router();

// Get all rooms
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { createdAt: "asc" },
    });
    res.status(200).json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Create room
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: "Room name is required" });
    return;
  }

  try {
    const room = await prisma.room.create({
      data: { name },
    });
    res.status(201).json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
