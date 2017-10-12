var assert = require('assert');
var fs = require('fs');
var path = require('path');

var uploadUtil = require('../library/uploadUtil');
var authResourceUtil = require('../library/authResourceUtil');
var fileResourceUtil = require('../library/fileResourceUtil');

describe('File Resource - fileResourceUtil', () => {
  var uuid_file_name = 1;
  var filePath = 'some_fpath';
  var first_file;
  var second_file;
  var userid;

  it('grab user id to upload file to...', (done) => {
    authResourceUtil.findLocalUser('admin@admin.com')
      .then(function(user) {
          // already in db
          userId = user[0].id;
          done();
      }, done);
  });

  it('create files and find file by userId', (done) => {
    Promise.all([
      _createFile(),
      _createFile(),
      _createFile(),
      _createFile(),
    ]).then(function(){
      fileResourceUtil.findFilesByUserId(userId)
        .then(function(files){
          console.log('all files... suite 1.', files.length)
          console.log(files)
          assert.equal(files.length >= 4, true);
          first_file = files[0];
          second_file = files[1];
          done();
        })
    });
  });



  it('find file by file id', (done) => {
    fileResourceUtil.findFileByFileId(first_file.id)
      .then((matched_first_file) => {
        console.log('*** a - find by file id 1', matched_first_file)
        assert.equal(matched_first_file.name, first_file.name)
        done();
      })
  });



  it('update file first_file', (done) => {
    fileResourceUtil.updateOldFile(
      first_file.id, 'updated_new_filename', 'updated_new_filepath', 'updated_new_filedescription'
    )
    .then(() => {
      fileResourceUtil.findFileByFileId(first_file.id)
        .then((matched_first_file) => {
          console.log('*** b - find by file id 1', matched_first_file)

          assert.equal(matched_first_file.id, first_file.id)
          assert.equal(matched_first_file.userId, userId)
          assert.equal(matched_first_file.name, 'updated_new_filename')
          assert.equal(matched_first_file.path, 'updated_new_filepath')
          assert.equal(matched_first_file.description, 'updated_new_filedescription')
          done();
        })
    })
  });




  it('delete file second_file', (done) => {
    fileResourceUtil.deleteFile(
      second_file.id
    )
    .then(() => {
      fileResourceUtil.findFilesByUserId(userId)
        .then((files) => {
          console.log('all files... suite 2.', files.length)
          console.log(files)


          assert.equal(files.length >= 3, true)
          done();
        })
    })
  });



  function _createFile(){
    var ts = Date.now();
    var fileName = 'test_static_text_' + ts + '_' + uuid_file_name + '.txt';
    var fileDescription = 'some_description_' + ts + '_' + uuid_file_name;
    var fileContent = `test_timestamp = ${Date.now()}
fileName=${fileName}
fileName=${fileDescription}`;
    uuid_file_name++;


    var azureContainerName = userId;
    var azureFileName = fileName;


    // write file
    var localFilePath = path.join('.', uploadUtil.getTempUploadPath(), fileName);
    fs.writeFileSync(
      localFilePath,
      fileContent
    )

    return uploadUtil.uploadFileToAzure(
      azureContainerName,
      azureFileName,
      localFilePath,
      fileName,
      fileDescription
    )
  }
})
