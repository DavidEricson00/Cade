import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { requestLogger } from './middlewares/request-logger';
import { businessDays } from './middlewares/business-days';
import router from './routes/index.route';

const PORT = process.env.PORT || 3000;

const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((origin) =>
  origin.trim(),
) ?? [];

const app = express();

app.use(express.json());

app.use(requestLogger);
app.use(businessDays);

app.get('/', (req, res) => {
  res.json({ message: 'API do Cadê? funcionando!' });
});

app.use(
  cors({
    origin: corsOrigins,
  }),
);

app.use('/', router);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

export default app;