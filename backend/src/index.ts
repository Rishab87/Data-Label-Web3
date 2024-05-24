import express from 'express'
const app = express();
import  {cloudinaryConnect} from '../config/cloudinary';
import authRoutes from '../routes/auth';
import taskRoutes from '../routes/tasks';
import fileUploader from 'express-fileupload';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';

const allowedOrigins = ['http://localhost:3000'];

app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);  // Allow the origin
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,  // If you're sending credentials
    })
  );
  
  app.options('*', cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin' , 'Content-Type', 'Authorization'],  
    credentials: true, 
  }));
  
app.use(express.json());

const PORT = process.env.PORT || 5000;

cloudinaryConnect();

app.use(fileUploader({
    useTempFiles: true, 
    tempFileDir: '/tmp/',
}));

app.use('/api/v1/auth' , authRoutes);
app.use('/api/v1/task' , taskRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);    
});