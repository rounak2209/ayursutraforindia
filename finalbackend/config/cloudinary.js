import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import 'dotenv/config';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Storage Engine Setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'panchkarma_uploads', // Cloudinary me folder ka naam
    resource_type: 'auto',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
  },
});

// 3. Multer Instance 
const upload = multer({ storage: storage });

export { upload, cloudinary };