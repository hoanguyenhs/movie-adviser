/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts" />

/*
* Loading icon
*/
function showLoadingIcon() {
    var str = '';
    str = '<div style="position: fixed;top: 0;right: 0;bottom: 0;left: 0;height: 100%;width: 100%; margin: 0;padding: 0;background: #000000;opacity: 0.5;"></div>';
    str += '<div style="position: fixed; top: 50%; left: 47%;"><img src="images/ajax-loader.gif" width="126px" height="30px" /></div>';
    var showLoading = $('<div id="showLoading">');
    showLoading.html(str).dialog({
        autoOpen: false,
        modal: true,
        draggable: false,
        width: 'auto',
        resizable: false
    }).dialog('open');
    $('.ui-dialog-titlebar-close').remove();
    $('.ui-dialog-titlebar').remove();
    $('body>div.ui-front').removeClass('ui-dialog-content');
    $('body>div.ui-front').removeClass('ui-widget-content');
}

function hideLoadingIcon() {
    $('#showLoading').dialog('destroy').remove();
}
/*
* End loading icon
*/

/*
* Read image url
*/
function readFile(input: HTMLInputElement, img: HTMLImageElement) {
    if (input.files && input.files[0]) {
        if (input.files[0].type == 'image/jpeg' ||
            input.files[0].type == 'image/png') {
            var reader = new FileReader();
            reader.readAsDataURL(input.files[0]);
            reader.onload = function (e: Event) {
                img.src = reader.result;
            }
        } else {
            alert('Image have to be in jpeg or png format. Please choose another one.')
        }
    }
}

/*
* Display image
*/
$('#fileUpload').click(function () {
    $('#fileUploadDisplay').removeAttr('src');
    $('#fileUploadDisplay').css('height', '500px');
});
$('#fileUpload').change(function () {
    readFile(this, <HTMLImageElement>$('#fileUploadDisplay')[0]);
    $('#fileUploadDisplay').css('height', 'auto');
});

/*
* Define Face class
*/
class Face {
    faceId: string;
    faceAttributes: FaceAttributes;
    constructor(id: string, attr: FaceAttributes) {
        this.faceId = id;
        this.faceAttributes = attr;
    }
}

class FaceAttributes {
    smile: number;
    gender: string;
    age: number;
    constructor(s: number, g: string, a: number) {
        this.smile = s;
        this.gender = g;
        this.age = a;
    }
}
var faces = new Array<Face>();

/*
* Call Face Detect API
*/
$('#analyzeBtn').click(function (e: Event) {
    $('#resultOfFaceApi').html('');
    var input = <HTMLInputElement>$('#fileUpload')[0];
    if (!input.files[0]) {
        alert('Please choose a image.');
        return;
    }
    var params = {
        // Request parameters
        "returnFaceId": "true",
        "returnFaceLandmarks": "false",
        "returnFaceAttributes": "age,gender,smile",
    };
    $.ajax({
        url: 'https://api.projectoxford.ai/face/v1.0/detect?' + $.param(params),
        type: 'POST',
        dataType: 'json',
        processData: false,
        headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': '144cd8ba993a442ca6bf93c1f2d286d9'
        },
        data: input.files[0],
        beforeSend: function (xhr: JQueryXHR) {
            showLoadingIcon();
        },
        success: function (data: Array<Face>) {
            if (data.length == 0) {
                alert('Please choose a image.');
                hideLoadingIcon();
                return;
            }
            var li = '<li>Found ' + data.length + ' person(s)</li>';
            $('#resultOfFaceApi').append(li);
            var count = 1;
            data.forEach(element => {
                faces.push(element);
                li = '<li>Person ' + count + ': ' + element.faceAttributes.age + ', ' +
                    element.faceAttributes.gender + ' and ' +
                    element.faceAttributes.smile + '</li>';
                $('#resultOfFaceApi').append(li);
                count++;
            });
            hideLoadingIcon();
        },
        error: function (xhr: JQueryXHR, status: string, error: string) {
            hideLoadingIcon();
            alert(error);
        }
    });
});

/*
* Calculate the rules based on faces
*/
function calculateRules(faces: Array<Face>) {

}