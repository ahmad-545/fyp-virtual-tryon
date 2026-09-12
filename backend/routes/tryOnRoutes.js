import express from "express";
import upload from "../middleware/multer.js";
import { executeTryOn, getUserTryOnHistory } from "../controllers/tryOnController.js";

const tryOnRouter = express.Router();

// Pipeline B - Virtual Try-On Execution
tryOnRouter.post("/", upload.single("photo"), executeTryOn);
tryOnRouter.post("/process-tryon", upload.single("photo"), executeTryOn);

// Try-On History
tryOnRouter.get("/history/:userId", getUserTryOnHistory);

export default tryOnRouter;
