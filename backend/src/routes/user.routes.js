import express from "express";
import {  signup, login } from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = express.Router();

router.route("/create").post(upload.single("pic"), signup);

router.route("/login").post(upload.none(), login);

export default router;