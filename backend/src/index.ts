const express = require('express')
const app = express();
const authRoutes =  require('./routes/auth');

const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/api/v1/' , authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);    
});