import express from "express";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import morgan from "morgan";
import { errorMiddleware } from "./middleware/errorMiddleware";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/comment", commentRoutes);

app.get("*", (req, res, next) => {
    res.send("<h1>404 Not found</h1>");
});

app.use(errorMiddleware);

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started on port 3000");
});
