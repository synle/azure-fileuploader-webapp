var daoUtil = require('./daoUtil');

var authResourceUtil = {
  createUserLocal: function(email, firstName, lastName, password){
    var encryptedPassword = _getEncryptedPassword(password);
    return daoUtil.UserLocal.create({
      email: email,
      firstName: firstName,
      lastName: lastName,
      password: encryptedPassword,
    });
  },
  findLocalUserByEmailAndPassword: function(email, password){
    var encryptedPassword = _getEncryptedPassword(password);
    return daoUtil.UserLocal.findAll({
      attributes: { exclude: ['password'] },
      where: { email: email, password: encryptedPassword, }
    });
  },
  findLocalUser: function(email){
    return daoUtil.UserLocal.findAll({
      attributes: { exclude: ['password'] },
      where: { email: email }
    });
  },
  findLocalUserByUserId: function(userId){
    return daoUtil.UserLocal.findOne({
      attributes: { exclude: ['password'] },
      where: { id: userId }
    });
  }
};

function _getEncryptedPassword(password){
  return password;
}

module.exports = authResourceUtil;
