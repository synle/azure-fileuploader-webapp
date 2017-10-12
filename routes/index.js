// internal
var fileResourceUtil = require('../library/fileResourceUtil');
var uploadUtil = require('../library/uploadUtil');
var blobUtil = require('../library/blobUtil');
var cacheUtil = require('../library/cacheUtil');


// values
var blobSvc = blobUtil.getBlobSrvc();
var multerUploadSrvc = uploadUtil.getMulterUploadSrvc();


// route definitions...
module.exports = function(app, passport){
    // auth
    app.get('/', function(req, res, next) {
        res.render('index', {});
    });

    // get - login form
    app.get('/login', function(req, res, next) {
        res.render('login', { message: req.flash('loginMessage') });
    });

    // post - process login ajax
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));



    // get sign up form
    app.get('/signup', function(req, res, next) {
        res.render('signup', { message: req.flash('signupMessage') }  );
    });


    // post - process the signup ajax
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));



    // =====================================
    // AUTHENTICATED PAGES =================
    // =====================================

    // main profile page
    app.get('/profile', isLoggedIn, function(req, res) {
        var user = req.user;
        res.render('profile', {
            user : req.user // get the user out of session and pass to template
        });
    });



    // get list of all file
    app.get('/file', isLoggedIn, function(req, res) {
        var user = req.user;
        var userId = user.id;

        var cacheKey = 'file-list-' + userId;
        cacheUtil.get(cacheKey).then(
            function(data){
                if(!!data && data.length >= 0){
                    // data from cache
                    res.json({
                        success: true,
                        result: data
                    })
                } else {
                    // data not from cache
                    fileResourceUtil.findFilesByUserId(userId)
                        .then(function(files){
                            // save data to cache
                            cacheUtil.set(cacheKey, files);

                            res.json({
                                success: true,
                                result: files
                            })
                        },
                        function(err){
                            res.status(400);

                            res.json({
                                success: false,
                                result: err
                            })
                        }
                    )
                }
            }
        )
    });




    app.get('/file/:file_id', isLoggedIn, function(req, res) {
        var user = req.user;
        var userId = user.id;
        var fileId = req.params.file_id;


        var cacheKey = 'file-item-' + fileId;
        cacheUtil.get(cacheKey).then(
            function(data){
                if(!!data){
                    // data from cache
                    res.json({
                        success: true,
                        result: data
                    })
                } else {
                    // data not from cache
                    fileResourceUtil.findFileByFileId(fileId)
                        .then(function(file){
                            // save it to cache...
                            cacheUtil.set(cacheKey, file)

                            res.json({
                                success: true,
                                result: file
                            })
                        },
                        function(err){
                            res.status(400);
                            res.json({
                                success: false,
                                result: err
                            })
                        }
                    )
                }
            }
        );
    });


    app.post('/file/upload', multerUploadSrvc.single('createFile'), function (req, res, next) {
        var user = req.user;
        var userId = user.id;
        var fileDescription = req.body.fileDescription;
        var fileName = req.body.fileName;
        var localFilePath = req.file.path;
        var localFileName = req.file.originalname;
        var azureContainerName = userId;
        var azureFileName = Date.now() + '-' + localFileName;


        // purge the cache
        cacheUtil.clear('file-list-' + userId);


        // upload file to azure
        uploadUtil.uploadFileToAzure(
            azureContainerName,
            azureFileName,
            localFilePath,
            fileName,
            fileDescription
        ).then(
            function(data){
                res.redirect('../profile');
            },
            function(err){
                res.redirect('../profile');
            }
        );
    });


    // update file
    app.post('/file/update', isLoggedIn, function(req, res) {
        var user = req.user;
        var userId = user.id;
        var fileId = req.body.fileId;
        var fileName = req.body.fileName;
        var fileDescription = req.body.fileDescription;


        // purge the cache
        cacheUtil.clear('file-item-' + fileId);
        cacheUtil.clear('file-list-' + userId);

        fileResourceUtil.updateOldFile(
            fileId, fileName, fileDescription
        )
            .then(function(data){
                res.json({
                    success: true,
                    result: data
                })
            },
            function(err){
                res.status(400);

                res.json({
                    success: false,
                    result: err
                })
            })
    });


    // delete file
    app.post('/file/delete', isLoggedIn, function(req, res) {
        var user = req.user;
        var userId = user.id;
        var fileId = req.body.fileId;


        // purge the cache
        cacheUtil.clear('file-item-' + fileId);
        cacheUtil.clear('file-list-' + userId);


        fileResourceUtil.softDeleteFile( fileId )
            .then(function(data){
                    res.json({
                        success: true,
                        result: fileId
                    })
                },
                function(err){
                    res.status(400);

                    res.json({
                        success: false
                    })
                })
    });


    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
}


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
