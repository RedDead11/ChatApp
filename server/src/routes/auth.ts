import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

const router = Router();

// Signup

router.post("/signup", async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Login

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
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

    const token = jwt.sign(
      { userId: user.id, username: user.username }, // payload
      process.env.JWT_SECRET as string, // secret
      { expiresIn: "7d" },
    );

    res.status(200).json({ token, userId: user.id, username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
