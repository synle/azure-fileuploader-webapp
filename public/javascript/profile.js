// source: https://github.com/krasimir/navigo
// init navigo router
var root = null;
var useHash = true; // Defaults to: false
var hash = '#!'; // Defaults to: '#'
var router = new Navigo(root, useHash, hash);



var Ajax = {
    getFiles: function (){
        return $.get('/file');
    },
    getFileByFileId: function(fileId){
        return $.get(
            '/file/' + fileId,
        );
    },
    update: function(
        fileId,
        fileName,
        filePath,
        fileDescription
    ){
        return $.post(
            '/file/update',
            {
                fileId: fileId,
                fileName: fileName,
                filePath: filePath,
                fileDescription: fileDescription,
            }
        );
    },
    delete: function(fileId){
        return $.post(
            '/file/delete',
            {
                fileId: fileId
            }
        );
    }
}


var PageRenderer = {
    renderList: function(){
        _select_tab('filelist-container');


        $('#file-list-table-content').empty();
        Ajax.getFiles().then(function(data){
            var files = data.result || [];
            files.forEach(function(file){
                $('#file-list-table-content').append(`
                    <tr class="row-update-file-item cpointer" data-id="${file.id}">
                        <td>${file.name}</td>
                        <td>${file.description}</td>
                        <td>${file.firstName} ${file.lastName}</td>
                        <td>${file.createdAt}</td>
                        <td>${file.updatedAt}</td>
                        <td>
                            <button class="btn btn-sm btn-info" data-id="${file.id}">
                                <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
                                Edit
                            </button>
                            <button class="btn btn-sm btn-danger row-remove-file-item" data-id="${file.id}">
                                <i class="fa fa-trash" aria-hidden="true"></i>
                                Delete
                            </button>
                            <button class="btn btn-sm btn-default row-download-file-item" data-path="${file.path}">
                                <i class="fa fa-cloud-download" aria-hidden="true"></i>
                                Download
                            </button>
                        </td>
                    </tr>
                `);
            });
        });
    },
    renderNewFile: function(){
        _select_tab('upload-new-file-container');
        $('#createAuthor').val(current_user.firstName + ' ' + current_user.lastName)
    },
    renderUpdateFile: function(params){
        _select_tab('upload-edit-file-container')

        var file_id = params.file_id;

        Ajax.getFileByFileId(file_id)
            .then(function(data){
                var file = data.result;

                $('#updateFileName').val(file.name || '')
                $('#updateDescription').val(file.description || '')
                $('#updatePath').val(file.path || '');
                $('#updateDownloadFile').data('path', file.path);
                $('#updateFileId').val(file_id);
                $('#updateUploadedTime').val(file.createdAt);
                $('#updateUpdatedTime').val(file.updatedAt);
            })

    }
};


var PageNavigator = {
    renderList: function(){
        router.navigate('file/list');
    },
    renderListRefresh: function(){
        location.reload();
    },
    renderNewFile: function(){
        router.navigate('file/new');
    },
    renderUpdateFile: function(file_id){
        router.navigate('file/detail/' + file_id);
    }
};




// init
$(function(){
    // router
    router
      .on({
        'file/detail/:file_id': PageRenderer.renderUpdateFile,
        'file/new': PageRenderer.renderNewFile,
        'file/list': PageRenderer.renderList,
        '*': PageRenderer.renderList
      })
      .resolve();

    $('#file-list-table-content')
        .on('click', '.row-remove-file-item', function(e){
            e.stopPropagation();
            e.preventDefault();

            var file_id = $(this).data('id');
            if(confirm('Do you want to delete this record?')){
                Ajax.delete(file_id)
                    .then(function(){
                        PageNavigator.renderListRefresh();
                    })
            }
        })
        .on('click', '.row-update-file-item', function(){
            var file_id = $(this).data('id');
            PageNavigator.renderUpdateFile(file_id);
        })
        .on('click', '.row-download-file-item', _onDownloadFileClicked);

    $('.upload-edit-file-container').on(
        'click', '.row-download-file-item', _onDownloadFileClicked
    );


    // submit create form...
    $('#btn-submit-create-form').click(function(){
        // check for error
        var errorMsgs = _getFormErrors([
            '#createFile',
            '#createFileName',
            '#createDescription',
        ]);

        if(errorMsgs.length > 0){
            return alert('Please fix the following errors: \n' + errorMsgs.join('\n'))
        }

        // all good submit the form
        $('#submit-create-form').submit();
    });



    $('#btn-submit-update-form').click(function(){
        // check for error
        var errorMsgs = _getFormErrors([
            '#updateFileName',
            '#updateDescription',
        ]);

        if(errorMsgs.length > 0){
            return alert('Please fix the following errors: \n' + errorMsgs.join('\n'))
        }


        // all good submit the form
        Ajax.update(
            $('#updateFileId').val(),
            $('#updateFileName').val(),
            $('#updatePath').val(),
            $('#updateDescription').val()
        ).then(function(){
            PageNavigator.renderList();
            alert('Record Updated')
        })
    });

    function _onDownloadFileClicked(e){
        e.stopPropagation();
        e.preventDefault();

        var file_path = $(this).data('path');
        window.open(file_path)
    }

    function _getFormErrors(formElems){
        return [].concat(formElems).reduce(
            function(res, curSelector){
                if($(curSelector).val().length === 0){
                    return res.concat('"' + $(curSelector).data('label') + '" is Required')
                }

                return res;
            },
            []
        );
    }
})


function _select_tab(tab){
    console.log('selecting...', tab)
    $('.my-app-nav-item').removeClass('btn-primary');
    $('.my-app-container').addClass('hidden');

    $('.' + tab + '.my-app-nav-item').addClass('btn-primary');
    $('.' + tab + '.my-app-container').removeClass('hidden');
}
