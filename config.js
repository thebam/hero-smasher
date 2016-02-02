var env = process.env.NODE_ENV || 'development';
var config = {
    port: 5001,
    db: 'mongodb://localhost:27017/heroSmasher',
    host: 'localhost'
}; 
module.exports = config; 