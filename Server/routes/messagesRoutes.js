
import {Router} from "express";
import {verifyToken} from "../middleware/AuthMiddleware.js"
import { getMessages } from "../controller/MessageController.js";
const messagesRouter=Router()

messagesRouter.post("get-messages",verifyToken,getMessages);

export default messagesRouter;