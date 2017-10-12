var Sequelize = require('sequelize');

// internal
var daoUtil = require('./daoUtil');
var authResourceUtil = require('./authResourceUtil')


// doing the join here...
function _getMapUserDefinitions(userId, data){
  return authResourceUtil.findLocalUserByUserId(userId)
    .then(function(user){
      // the id to userId
      user.userId = user.id;
      delete user.id;

      return data.map(function(item){
        item = Object.assign(
          item,
          user
        )
        return item;
      })
    })
}

// def
var fileResourceUtil = {
  getAllDeletedFiles: function(){
    return daoUtil.File
      .findAll({
        where: { isDeleted: true }
      });
  },
  findFilesByUserId: function(userId){
    return daoUtil.File
      .findAll({
        where: { userId: userId, isDeleted: false }
      })
      .then(
        function(data){
          return _getMapUserDefinitions(userId, data);
        }
      );
  },
  findFileByFileId: function(fileId){
    return daoUtil.File
      .findAll({
        where: { id: fileId, isDeleted: false }
      })
      .then(
        function(data){
          return _getMapUserDefinitions(data[0].userId, data)
            .then(function(data2){
              return data2[0]
            });
        }
      );
  },
  createNewFile: function(
    userId,
    fileName,
    fileDescription,
    filePath,
    azureContainerName,
    azureFileName
  ){
    return daoUtil.File.create({
      userId: userId,
      name: fileName,
      path: filePath,
      description: fileDescription,
      azureContainer: azureContainerName,
      azureName: azureFileName,
    });
  },
  updateOldFile: function(fileId, fileName, fileDescription){
    return daoUtil.File.update(
      {
        name: fileName,
        description: fileDescription
      },
      {
        where: { id: fileId }
      }
    );
  },
  softDeleteFile: function(fileId){
    return daoUtil.File.update(
      {
        isDeleted: true
      },
      {
        where: { id: fileId }
      }
    );
  },
  hardDeleteFile: function(fileId){
    return daoUtil.File.destroy({
      where: { id: fileId }
    });
  }
};

module.exports = fileResourceUtil;
