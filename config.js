var env = process.env.NODE_ENV || 'development';

var mongoDb = process.env.CUSTOMCONNSTR_DB_URL || 'mongodb://localhost:27017/heroSmasher';

var config = {
    port: 5001,
    db: mongoDb,
    host: 'localhost'
}; 
module.exports = config; 