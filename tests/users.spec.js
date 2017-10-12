var assert = require('assert');
var fs = require('fs');
var path = require('path');

var uploadUtil = require('../library/uploadUtil');
var authResourceUtil = require('../library/authResourceUtil');
var fileResourceUtil = require('../library/fileResourceUtil');

describe('Auth Resource - authResourceUtil', () => {
  it('has user', (done) => {
    authResourceUtil.findLocalUser('admin@admin.com')
      .then(function(user) {
          // already in db
          if(user.length === 0){
            throw 'not found'
          }
          done();
      }, function(){
        // not there yet, add the user
        throw 'not found'
      }).catch(function(){
        authResourceUtil.createUserLocal('admin@admin.com', 'first_admin', 'last_admin', 'admin')
          .then(function (argument) {
              authResourceUtil.findLocalUser('admin@admin.com')
                .then(function(user) {
                    assert.equal(user.length, 1);
                    done();
                });
          });
      });
  });


  it('no user', (done) => {
    authResourceUtil.findLocalUser('admin@admin.js555')
      .then(function(user) {
        assert.equal(user.length, 0);
        done()
      });
  });
})
