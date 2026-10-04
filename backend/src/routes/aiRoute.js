import express from "express";
import {generateTripPlan} from "../controllers/tripController.js";
import { aiSearchProperties } from "../controllers/aiPropertyController.js";

const aiRouter = express.Router();
aiRouter.route("/").post(generateTripPlan);
aiRouter.route("/search-properties").post(aiSearchProperties);

export {aiRouter};