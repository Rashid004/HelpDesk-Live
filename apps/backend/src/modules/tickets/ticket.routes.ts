import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { TicketController } from "./ticket.controller.js";
import { TicketService } from "./ticket.service.js";

const router = Router();

const service = new TicketService();
const controller = new TicketController(service);

router.use(authenticate);

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.get("/track/:referenceNumber", controller.getByReferenceNumber);

router.post("/attachments/upload-url", controller.getAttachmentUploadUrl);

router.post("/", authorize("customer"), controller.create);
router.post("/:id/rate", authorize("customer"), controller.rate);

router.patch("/:id/claim", authorize("agent"), controller.claim);
router.patch("/:id/status", authorize("agent"), controller.updateStatus);

export default router;
