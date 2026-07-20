import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  adminEmail: (process.env.ADMIN_EMAIL || 'abdulsamadkhattak5@gmail.com').toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
  adminName: process.env.ADMIN_NAME || 'حافظ عبدالصمد خٹک',
  adminPhone: process.env.ADMIN_PHONE || '03215315603',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
};

export const site = {
  siteName: 'ASK REAL ESTATE FAISALABAD',
  shortName: 'ASK Estate',
  contactEmail: 'abdulsamadkhattak5@gmail.com',
  phone: '03215315603',
  phoneDisplay: '0321-5315603',
  contactName: 'حافظ عبدالصمد خٹک',
  city: 'فیصل آباد',
};
