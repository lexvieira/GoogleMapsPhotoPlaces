import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import unshorterurl from './controllers/urlUnshortController';

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN_PROD : process.env.CORS_ORIGIN_DEV,
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type,Authorization',
};

app.get('/', (req: Request, res: Response) => {
  setTimeout(() => {   
    res.redirect('https://n-code.co'); 
  }, 500); 
});

app.use(cors(corsOptions));
app.use(unshorterurl);
app.listen(port, () => {
  
});
