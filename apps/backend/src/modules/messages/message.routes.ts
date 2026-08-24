import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { MessageController } from "./message.controller.js";
import { MessageService } from "./message.service.js";

const router = Router();

const service = new MessageService();
const controller = new MessageController(service);

router.use(authenticate)

router.post("/", controller.sendMessage);
router.get("/", controller.getMessages);
router.patch("/:messageId/read", controller.markMessageAsRead);
router.patch("/read-all", controller.markAllMessagesAsRead);

export default router;
