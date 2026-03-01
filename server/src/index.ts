import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import roomsRouter from "./routes/rooms.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Chat server running");
});

app.use("/api/auth", authRouter);
app.use("/api/rooms", roomsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
