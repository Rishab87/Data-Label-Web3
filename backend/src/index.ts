const express = require('express')
const app = express();
const {cloudinaryConnect} = require('./config/cloudinary');
const authRoutes =  require('./routes/auth');
const fileUploader = require('express-fileupload');

const PORT = process.env.PORT || 5000;

cloudinaryConnect();

app.use(fileUploader({
    useTempFiles: true, 
    tempFileDir: '/tmp/',
}));

app.use(express.json());

app.use('/api/v1/' , authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);    
});