import { Router } from 'express';
import { getReport } from '../controllers/report-controller';

const itemRoutes = Router();

// Rota do relatório PDF — deve ficar antes de /:id para evitar conflito
itemRoutes.get('/report', getReport);

export { itemRoutes };
