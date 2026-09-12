import express from "express";
import {
  subscribeEmail,
  getAllSubscribers,
  deleteSubscriber,
} from "../controllers/subscriberController.js";

const router = express.Router();

router.post("/subscribe", subscribeEmail);
router.get("/all", getAllSubscribers);
router.delete("/:id", deleteSubscriber);

export default router;