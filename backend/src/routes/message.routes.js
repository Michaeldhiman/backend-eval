import express from "express";
import { isLoggedIn } from "../middlewares/auth.middlewares.js";
import { create, deleteMessage, getUsersMessages, updateMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.route("/create").post(isLoggedIn, create);

router.route("/messages/:id").get(isLoggedIn, getUsersMessages);

router.route("/message/:_id").patch(isLoggedIn, updateMessage).delete(isLoggedIn, deleteMessage);

export default router;