import { Router } from "express";
import RequestLogRoute from "./requestLog.route.js";

const router = Router();

router.use('/logs', RequestLogRoute);

export default router;