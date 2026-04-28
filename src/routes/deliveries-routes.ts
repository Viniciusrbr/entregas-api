import { Router } from "express";
import { DeliveriesController } from "@/controllers/deliveries-controller";
import { ensureAuthenticated } from "@/middleware/ensure-authenticated";
import { verifyUserAuthorization } from "@/middleware/verifyUserAuthorization";

const deliveriesRoutes = Router();
const deliveriesController = new DeliveriesController();

deliveriesRoutes.use(ensureAuthenticated, verifyUserAuthorization(['sale']));
deliveriesRoutes.post('/', deliveriesController.create);

export { deliveriesRoutes };