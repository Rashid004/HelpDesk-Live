import { Router } from "express";
import { TicketController } from "./ticket.controller.js";
import { TicketService } from "./ticket.service.js";

const router = Router();

const service = new TicketService();
const controller = new TicketController(service);

// TODO: replace with real authenticate/authorize middleware once the user
// module + JWT auth is implemented. Currently every request is treated as
// this dummy user so the tickets module is testable in isolation.
router.use((req, _res, next) => {
  req.user ??= { id: "000000000000000000000000", role: "customer" };
  next();
});

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.get("/track/:referenceNumber", controller.getByReferenceNumber);

router.post("/", controller.create); // TODO: authorize("customer")
router.post("/:id/rate", controller.rate); // TODO: authorize("customer")

router.patch("/:id/claim", controller.claim); // TODO: authorize("agent")
router.patch("/:id/status", controller.updateStatus); // TODO: authorize("agent")

export default router;
