import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./utils/db.js";
import {router} from "./routes/userRoutes.js";
import {propertyRouter} from "./routes/propertyRouter.js"; 
import {bookingRouter} from "./routes/bookingRoute.js"
import morgan from "morgan"
import { aiRouter } from "./routes/aiRoute.js";
import cors from "cors"
dotenv.config();
const app = express();
app.use(express.json({
    limit: "100mb",
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
app.use(express.urlencoded({limit:"100mb",extended:true}));
app.use(cookieParser());
const isProd = process.env.NODE_ENV === "production";
const rawOrigins = [
    process.env.ORIGIN_ACCESS_URL,
    process.env.FRONTEND_URL,
    "https://homelyhub-c4md-jk3mviiia-aj386092-hashs-projects.vercel.app"
];
if (!isProd) {
    rawOrigins.push(
        "http://localhost:5173",
        "http://localhost:3000",
        "http://10.93.42.63:5173"
    );
}
const allowedOrigins = rawOrigins
    .filter(Boolean)
    .map(url => url.endsWith("/") ? url.slice(0, -1) : url);

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (e.g. mobile apps, curl) or whitelisted
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked for origin: ${origin}`));
        }
    },
    credentials: true
}))

const port = process.env.PORT || 3000;
app.use(morgan("dev"))
app.get("/",(req,res)=>{
    res.send("Hello World");
});

app.use("/api/v1/rent/user",router);
app.use("/api/v1/rent/listing",propertyRouter);
app.use("/api/v1/rent/user/booking",bookingRouter);
app.use("/api/v1/rent/trip",aiRouter)

app.listen(port, "0.0.0.0", () => {
    connectDB();
    console.log(`Server is running on port ${port}`);
    console.log(`Network access: http://10.93.42.63:${port}`);
})