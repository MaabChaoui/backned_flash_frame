import { Router } from "express";
import { newPostConstroller } from "../controllers/photographer.controllers";



const router = Router()


router.post("/newPost", newPostConstroller)