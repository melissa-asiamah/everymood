// config/database.js
module.exports = {

    'url' : `mongodb+srv://${process.env.User_Name}:${process.env.User_Password}@cluster0-xu4rv.mongodb.net/${process.env.DB_Name}?retryWrites=true&w=majority`, // looks like mongodb://<user>:<pass>@mongo.onmodulus.net:27017/Mikha4ot
    'dbName': 'final-project'
};
