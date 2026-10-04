import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./utils/db.js";
import {router} from "./routes/userRoutes.js";
import {propertyRouter} from "./routes/propertyRouter.js"; 
import {bookingRouter} from "./routes/bookingRoute.js"
import morgan from "morgan"
import { aiRouter } from "./routes/aiRoute.js";
import { reviewRouter } from "./routes/reviewRoute.js";
import { notificationRouter } from "./routes/notificationRoute.js";
import { analyticsRouter } from "./routes/analyticsRoute.js";
import { chatRouter } from "./routes/chatRoute.js";
import cors from "cors";
import http from "http";
import initializeSocket from "./socket.js";
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
const rawOrigins = [];
if (process.env.ORIGIN_ACCESS_URL) rawOrigins.push(...process.env.ORIGIN_ACCESS_URL.split(','));
if (process.env.FRONTEND_URL) rawOrigins.push(...process.env.FRONTEND_URL.split(','));

if (!isProd) {
    rawOrigins.push(
        "http://localhost:5173",
        "http://localhost:3000",
        "http://10.93.42.63:5173"
    );
}
const allowedOrigins = rawOrigins
    .filter(Boolean)
    .map(url => url.trim().endsWith("/") ? url.trim().slice(0, -1) : url.trim());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        // Check exact matches or dynamic Vercel preview deployments securely
        const isAllowed = allowedOrigins.includes(origin) || 
                          /^https:\/\/homelyhub(-.*)?\.vercel\.app$/.test(origin);
                          
        if (isAllowed) {
            callback(null, origin); // pass the origin back to reflect it dynamically
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
app.use("/api/v1/rent/trip",aiRouter);
app.use("/api/v1/rent/reviews",reviewRouter);
app.use("/api/v1/rent/notifications",notificationRouter);
app.use("/api/v1/rent/analytics",analyticsRouter);
app.use("/api/v1/rent/chat",chatRouter);

const server = http.createServer(app);
initializeSocket(server, allowedOrigins);

server.listen(port, "0.0.0.0", () => {
    connectDB();
    console.log(`Server is running on port ${port}`);
    console.log(`Network access: http://10.93.42.63:${port}`);
})
// trigger restart

// trigger restart 2
