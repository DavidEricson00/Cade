import { Router } from "express";
import RequestLogRoute from "./requestLog.route.js";
import ItemsRoutes from './items.routes';
import AuthRoutes from './auth.routes';

const router = Router();

router.use('/logs', RequestLogRoute);
router.use('/items', ItemsRoutes);
router.use('/auth', AuthRoutes);

export default router;