import cookieParser from 'cookie-parser';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import express from 'express';
import { router } from './controllers';

configDotenv();

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);

app.listen(process.env.PORT, () => {
  console.log('Server Running✔️');
});

export default app;
