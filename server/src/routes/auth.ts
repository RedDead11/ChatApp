import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../prisma.js";
import { error } from "node:console";

const router = Router();

// Signup

router.post("/signup", async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    res.status(400).json({ error: "Username or email already taken" });
    return;
  }

  // hash the password
  const hashed = await bcrypt.hash(password, 10);

  // create the user
  const user = await prisma.user.create({
    data: { username, email, password: hashed },
  });

  res.status(201).json({ message: "Account created!", userId: user.id });
});

// Login

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find User
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(400).json({ error: "Invalid email or password" });
    return;
  }

  // Check password
  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    res.status(400).json({ error: "Invalid email or password" });
    return;
  }

  res.status(200).json({ message: "Logged in", userId: user.id });
});

export default router;
