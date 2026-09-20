import { Router } from "express";
import RequestLogRoute from "./requestLog.route.js";
import ItemsRoutes from './items.routes';


const router = Router();

router.use('/logs', RequestLogRoute);
router.use('/items', ItemsRoutes);

export default router;