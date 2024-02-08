import express from "express";
import { getFeedController, getPostsContoller } from "../controllers/user.controllers";

const router = express.Router();

router.post("/getFeed", getFeedController);
router.post("/getPosts", getPostsContoller);

export default router;
