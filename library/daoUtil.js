var Sequelize = require('sequelize');
var sequelize;

var shouldUseCloud = process.env.DB_HOST
  && process.env.DB_NAME
  && process.env.DB_USER
  && process.env.DB_PASSWORD;


// if there is a db connection, then use it...
if(shouldUseCloud){
  var db_host = process.env.DB_HOST;


  console.log('connecting to REAL SQL', db_host);


  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: db_host,
      logging: false,
      dialect: 'mssql',
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
      dialectOptions: {
        encrypt: true
      }
    }
  );
} else {
  console.log('use local sqlite3: ./db.sqlite3');

  // use sqlite3
  sequelize = new Sequelize(
    'db_user', // 'database',
    'username', // 'username',
    'password', // 'password',
    {
      dialect: 'sqlite',
      storage: './db.sqlite3',
      logging: false
    }
  );
}

var UserLocal = sequelize.define('users', {
  id               : { type: Sequelize.DataTypes.UUID, defaultValue: Sequelize.DataTypes.UUIDV1, primaryKey: true },
  email            : { type: Sequelize.STRING },
  password         : { type: Sequelize.STRING },
  firstName        : { type: Sequelize.STRING },
  lastName         : { type: Sequelize.STRING },
});


var File = sequelize.define('files', {
  id               : { type: Sequelize.DataTypes.UUID, defaultValue: Sequelize.DataTypes.UUIDV1, primaryKey: true },
  name             : { type: Sequelize.STRING },
  description      : { type: Sequelize.STRING },
  path             : { type: Sequelize.STRING }, // path from azure
  azureContainer   : { type: Sequelize.STRING }, // azure container
  azureName        : { type: Sequelize.STRING }, // azure file name
  userId           : { type: Sequelize.UUID },
  isDeleted        : { type: Sequelize.BOOLEAN, defaultValue: false }, //whether or not it's deleted (soft delete)
});



// might only need to run for init call...
var promiseDbSync = sequelize.sync().then(function (argument) {
  // TODO: remove this log line...
  console.log('database...synced... read to use');
});

function Table(tableInstance){
  this.create = function(params){
    return promiseDbSync.then(
      function _tableCreate(){
        return tableInstance.create(params)
          .then(function(dataObject){
            return dataObject.dataValues;
          });;
      }
    );
  };


  this.update = function(params, whereClause){
    return promiseDbSync.then(
      function _tableUpdate(){
        return tableInstance.update(params, whereClause)
      }
    );
  }


  this.destroy = function(params){
    return promiseDbSync.then(
      function _destroy(){
        return tableInstance.destroy(params)
      }
    );
  }


  this.findOne = function(params){
    return promiseDbSync.then(
      function _tableFindOne(){
        return tableInstance.findOne(params)
          .then(function(dataObject){
            return dataObject.dataValues;
          });
      }
    );
  };


  this.findAll = function(params){
    return promiseDbSync.then(
      function _tableFindAll(){
        return tableInstance.findAll(params)
          .then(function(dataObjects){
            return dataObjects.map(function(dataObject){
              return dataObject.dataValues;
            });
          });
      }
    );
  };
}

module.exports = {
  UserLocal: new Table(UserLocal),
  File:      new Table(File)
}
