import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import authRouter from "./routes/auth.routes.js";
import sweetRouter from "./routes/sweets.routes.js";
import orderRouter from "./routes/order.routes.js";

dotenv.config({ path: './.env' });

const app = express();
app.set('trust proxy', true);

app.use(helmet());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/sweets", sweetRouter);
app.use("/api/v1/orders", orderRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

export { app };