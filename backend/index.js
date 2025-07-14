require('dotenv').config();
const app = require('./app');
const {connectDB} = require('./config/db.js');
const PORT = process.env.PORT || 3000;

connectDB().then(()=> {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error("Failed to connect to the database", err);
    process.exit(1);
})