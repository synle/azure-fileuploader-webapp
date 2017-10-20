# azure-fileuploader-webapp
- Student: Sy Le (https://www.linkedin.com/in/syle1021/)
- University Name: http://www.sjsu.edu/
- Course: Cloud Technologies (http://info.sjsu.edu/web-dbgen/catalog/courses/CMPE281.html)
- Professor Sanjay Garje (https://www.linkedin.com/in/sanjaygarje/)
- ISA: Divyankitha Urs (https://www.linkedin.com/in/divyankithaurs/)


## Description / Project Introduction
This is a web application that allows people to upload files to the server. This app is based on Azure Cloud, and uses Azure Storage to store the blob you uploaded, while maintaining a simple yet plain record of those files using Database.


## Live Demo
http://fileupload.syleapp.com

## Sample Demo Screenshots
![alt text](https://github.com/synle/azure-fileuploader-webapp/raw/master/Screen%20Shot%202017-10-20%20at%209.15.39%20AM.png "Sample Screenshot")
![alt text](https://github.com/synle/azure-fileuploader-webapp/raw/master/Screen%20Shot%202017-10-20%20at%209.15.13%20AM.png "Sample Screenshot")
![alt text](https://github.com/synle/azure-fileuploader-webapp/raw/master/Screen%20Shot%202017-10-20%20at%209.15.19%20AM.png "Sample Screenshot")


## Setup
### Requirements
```
    "node": "6.10.0"
```

### To install dependencies
```
    git checkout ...
    npm install
```


### To start the app
Please set up Azure SQL, Azure Redis Cache, Azure file storage and replace the following params with your setup...


#### Starting the web server
```
DB_HOST=yourazuredbappdomain.database.windows.net \
DB_USER=syle@yourazuredbappdomain \
DB_PASSWORD=yourpassword \
DB_NAME=fileuploadAppDb \
CACHE_HOST=your_azure_redis_domain.redis.cache.windows.net \
CACHE_PASSWORD=your_azure_redis_password \
BLOB_HOST=https://yourazurestoragedomain.blob.core.windows.net \
BLOB_PASSWORD=yourazure_storage_password \
BLOB_NAME=fileuploadapplobstorage \
UPLOAD_TEMP_FOLDER=uploads/ \
SESSION_SECRET="your_app_session_secret_something_secure_here" \
MAX_FILE_SIZE_MB=10000 \
    node index.js
```


## DB Schema
### Users
```
    id              : DataTypes.UUID, primaryKey
    email           : STRING
    password        : STRING
    firstName       : STRING
    lastName        : STRING
```

### Files
```
    id              : DataTypes.UUID, primaryKey
    name            : STRING
    description     : STRING
    path            : STRING // path from azure
    azureContainer  : STRING // azure container
    azureName       : STRING // azure file name
    userId          : UUID   // foreign key that references the users
    isDeleted       : BOOLEAN, defaultValue: false //whether or not it's deleted (soft delete), we have another azure function that cleans up soft deleted files...
```


## Links / Sources
### Repo for Azure Function to clean up Azure File Storage's deleted blobs
https://github.com/synle/azure-fileuploader-function

### General Setup
https://docs.microsoft.com/en-us/azure/storage/blobs/storage-nodejs-how-to-use-blob-storage
https://docs.microsoft.com/en-us/azure/app-service/custom-dns-web-site-buydomains-web-app

### Azure Blob Storage
https://docs.microsoft.com/en-us/azure/storage/blobs/storage-nodejs-how-to-use-blob-storage
https://stackoverflow.com/questions/41285434/how-to-find-out-the-stream-length-for-createblockblobfromstream-method
https://github.com/expressjs/multer/issues/392

### Azure Redis Cache
https://docs.microsoft.com/en-us/azure/redis-cache/cache-nodejs-get-started
