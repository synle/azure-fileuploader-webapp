var fs = require('fs');
var multer  = require('multer');

// internal
var fileResourceUtil = require('./fileResourceUtil');
var blobUtil = require('./blobUtil');

// config
var blobSvc = blobUtil.getBlobSrvc();
var tempUploadPath = process.env.UPLOAD_TEMP_FOLDER || 'uploads/';
var upload = multer({
    dest: tempUploadPath,
    limits: { fileSize: (process.env.MAX_FILE_SIZE_MB || 15) * 1000 }
});


var uploadUtil = {
    getMulterUploadSrvc: function(){
        return upload;
    },
    getTempUploadPath: function(){
        return tempUploadPath;
    },
    cleanupTempUpload: function(localFilePath){
        fs.unlinkSync(localFilePath);
    },
    uploadFileToAzure: function(azureContainerName, azureFileName, localFilePath, fileName, fileDescription){
        return new Promise(function(resolve, reject){
            blobSvc.createContainerIfNotExists(azureContainerName, {publicAccessLevel : 'blob'}, function(error, result, response){
            if(!error){
                console.log('done creating azure container', azureContainerName);

                // create container if needed
                blobSvc.createBlockBlobFromLocalFile(
                    azureContainerName, // container name
                    azureFileName, //  blob name
                    localFilePath, // localFileName
                    function(error, result, response){
                        if(!error){
                            // file uploaded
                            console.log('done sending file to azure')
                            var azureFullFilePath = blobUtil.getFullPath(
                                azureContainerName, // container
                                azureFileName // file name
                            );

                            fileResourceUtil.createNewFile(
                                azureContainerName,
                                fileName,
                                fileDescription,
                                azureFullFilePath,
                                azureContainerName,
                                azureFileName
                            )
                                .then(
                                    function(data){
                                        // remove the local file after created the blob
                                        uploadUtil.cleanupTempUpload(localFilePath);

                                        // resolve
                                        resolve();
                                    },
                                    function(err){

                                        // remove the local file after created the blob
                                        uploadUtil.cleanupTempUpload(localFilePath);

                                        // resolve
                                        resolve();
                                    }
                                );
                        }
                });
            }
            });
        });
    }
}


module.exports = uploadUtil;
