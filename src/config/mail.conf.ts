import * as nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// const sender:string = "contact@ncode.com.br"
// Configure Nodemailer with your email service settings

dotenv.config();

const mailconf = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  secure: true, 
  tls: {
     ciphers: "SSLv3",
  },
  requireTLS: true,
  port: 465,
  debug: true,
  connectionTimeout: 10000,
  // from: sender,
  auth: {
      user: process.env.USER,
      pass: process.env.PASS,
  },    
});

export {mailconf};
