import { Cashfree, CFEnvironment } from "cashfree-pg";
import dotenv from "dotenv";
dotenv.config();

let cashfree = null;

if (process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY && process.env.CASHFREE_APP_ID !== "dummy") {
  const env = process.env.CASHFREE_ENV === "PRODUCTION" || process.env.CASHFREE_ENV === "production" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
  cashfree = new Cashfree(env, process.env.CASHFREE_APP_ID, process.env.CASHFREE_SECRET_KEY);
} else {
  console.warn("⚠️ Cashfree credentials missing. Payments will fail.");
  cashfree = {
    PGCreateOrder: () => Promise.reject(new Error("Cashfree is not configured. Please check your .env variables.")),
    PGOrderFetchPayments: () => Promise.reject(new Error("Cashfree is not configured. Please check your .env variables.")),
  };
}

export default cashfree;
