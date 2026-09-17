import express from 'express';
import 'dotenv/config';
import { requestLogger } from './middlewares/request-logger';
import { businessDays } from './middlewares/business-days';
import router from './routes/index.route';
import itemsRoutes from './routes/items.routes';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use(requestLogger);
app.use(businessDays);

app.use("/items", itemsRoutes);

app.use('/', router);

app.get('/', (req, res) => {
  res.json({ message: 'API do Cadê? funcionando!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;