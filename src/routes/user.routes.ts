import express from "express";
import { getFeedController, getPostsContoller } from "../controllers/user.controller";

const router = express.Router();

router.post("/getFeed", getFeedController);
router.post("/getPosts", getPostsContoller);

export default router;
