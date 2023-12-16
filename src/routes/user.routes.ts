import express from "express";
import { getFeedController } from "../controllers/user.controller";

const router = express.Router();

router.post("/getFeed", getFeedController);

export default router;
