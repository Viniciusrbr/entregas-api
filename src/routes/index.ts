import { Router } from "express";
import { usersRoutes } from "./users-routes";
import { sessionsRouter } from "./sessions-routes";
import { deliveriesRoutes } from "./deliveries-routes";
import { deliveryLogsRoutes } from "./delivery-logs-routes";

const routes = Router();
routes.use('/users', usersRoutes);
routes.use('/sessions', sessionsRouter);
routes.use('/deliveries', deliveriesRoutes);
routes.use('/delivery-logs', deliveryLogsRoutes);

export { routes };