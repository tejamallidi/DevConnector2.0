const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');
const connectDB = async () => {
    try {
        // Since connect() returns a promise we have to use async await here. Good to have.
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('MongoDB Connected');
    } catch (err) {
        //If connection fails we will get the error message and process exits.
        console.log(err.message);
        process.exit(1);
    }
}

module.exports = connectDB;