/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts" />
/// <reference path="bootstrap.d.ts" />
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
function readFile(input, img) {
    if (input.files && input.files[0]) {
        if (input.files[0].type == 'image/jpeg' ||
            input.files[0].type == 'image/png') {
            var reader = new FileReader();
            reader.readAsDataURL(input.files[0]);
            reader.onload = function (e) {
                img.src = reader.result;
            };
        }
        else {
            alert('Image have to be in jpeg or png format. Please choose another one.');
        }
    }
}
/*
* Display image
*/
$('#fileUpload').click(function () {
    $('#fileUploadDisplay').removeAttr('src');
    $('#fileUploadDisplay').css('height', '500px');
    $('#results').html('');
    $('#instrutions').show();
});
$('#fileUpload').change(function () {
    readFile(this, $('#fileUploadDisplay')[0]);
    $('#fileUploadDisplay').css('height', 'auto');
    $('#instrutions').hide();
});
/*
* Define Face class
*/
var Face = (function () {
    function Face(id, attr) {
        this.faceId = id;
        this.faceAttributes = attr;
    }
    return Face;
}());
var FaceAttributes = (function () {
    function FaceAttributes(s, g, a) {
        this.smile = s;
        this.gender = g;
        this.age = a;
    }
    return FaceAttributes;
}());
var faces = new Array();
/*
* Call Microsoft Face Detect API
*/
$('#askBtn').click(function (e) {
    $('#resultOfFaceApi').html('');
    $('#results').html('');
    var input = $('#fileUpload')[0];
    if (!input.files[0]) {
        alert('Please choose a image.');
        return;
    }
    var params = {
        // Request parameters
        "returnFaceId": "true",
        "returnFaceLandmarks": "false",
        "returnFaceAttributes": "age,gender"
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
        beforeSend: function (xhr) {
            showLoadingIcon();
        },
        success: function (data) {
            if (data.length == 0) {
                alert('Cannot detect any faces in this image, please choose another image');
                hideLoadingIcon();
                return;
            }
            var str = '<ul id="resultOfFaceApi">';
            str += '<li>Found ' + data.length + ' person(s)</li>';
            var count = 1;
            data.forEach(function (element) {
                faces.push(element);
                str += '<li>Person ' + count + ': ' + element.faceAttributes.gender + ', ' +
                    element.faceAttributes.age + ' years old</li>';
                count++;
            });
            str += '</ul>';
            $('#myModalHeader').text('Image details');
            $('#myModalBody').append(str);
            $('#myModal').modal('show');
            hideLoadingIcon();
        },
        error: function (xhr, status, error) {
            hideLoadingIcon();
            alert(error);
        }
    });
});
/*
* When the modal is closed, call the next function to process
*/
$('#myModal').on('hidden.bs.modal', function () {
    if (movies.length == 0) {
        var genres = calculateGenres(faces);
        callThemovieDB(genres);
    }
    else {
        $('#myModalBody').html('');
    }
});
/*
* Calculate genres based on face attributes
*/
function calculateGenres(faces) {
    var genres;
    if (faces.length == 1) {
        if (faces[0].faceAttributes.age <= 12) {
            genres = '16,878'; // Animation, Science Fiction
        }
        else if (faces[0].faceAttributes.age <= 18) {
            genres = '28|12|35|878'; // Action, Adventure, Comedy, Science Fiction
        }
        else if (faces[0].faceAttributes.age <= 45) {
            genres = '28|12|16|35|80|99|18|14|36|27|9648|10749|878|53|10752'; // All genre
        }
        else {
            genres = '10752|10749|36|18'; // War, Romance, History, Drama
        }
    }
    else if (faces.length == 2) {
        var person1 = faces[0];
        var person2 = faces[1];
        var sameGender = person1.faceAttributes.gender == person2.faceAttributes.gender;
        var areAdult = person1.faceAttributes.age >= 16 && person2.faceAttributes.age >= 16;
        var ageAbsolute = Math.abs(person1.faceAttributes.age - person2.faceAttributes.age);
        if (!sameGender && areAdult && ageAbsolute <= 9) {
            genres = '35|18|10749|53'; // Comedy, Drama, Romance, Thriller
        }
        else if (!areAdult) {
            genres = '16,28|12|878'; // Action, Adventure, Animation, Science Fiction
        }
        else {
            genres = '28|12|16|35|80|99|18|14|36|27|9648|10749|878|53|10752'; // All genre
        }
    }
    else if (faces.length > 2) {
        var under16 = false;
        faces.forEach(function (face) {
            if (face.faceAttributes.age < 16) {
                under16 = true;
            }
        });
        if (under16) {
            genres = '16,28|12|878'; // Action, Adventure, Animation, Science Fiction
        }
        else {
            genres = '9648|27'; // Mystery, Horror (It is fun to watch in group)
        }
    }
    return genres;
}
/*
* Define Fovie class
*/
var Movie = (function () {
    function Movie(i, t, d, p, o, po, v, b, k, s, im) {
        this.id = i;
        this.title = t;
        this.release_date = d;
        this.poster_path = p;
        this.overview = o;
        this.popularity = po;
        this.vote_average = v;
        this.backdrop_path = b;
        this.key = k;
        this.site = s;
        this.imdb_id = im;
    }
    return Movie;
}());
var movies = Array();
/*
* Call themoviedb.org API
*/
function callThemovieDB(genres) {
    var params = {
        // Request parameters
        "api_key": "d2d687a6e5d66a89ab03cd29621cb432",
        "with_genres": genres
    };
    $.ajax({
        url: 'http://api.themoviedb.org/3/discover/movie?' + $.param(params),
        type: 'GET',
        dataType: 'json',
        processData: false,
        beforeSend: function (xhr) {
            showLoadingIcon();
        },
        success: function (data) {
            movies = data['results'];
            movies.forEach(function (movie) {
                var div = '<div class="movie"><hr>';
                div += '<div class="col-md-3 movie-poster">';
                div += '<img src="http://image.tmdb.org/t/p/w500' + movie.poster_path + '" width="250" height="300"></div>';
                div += '<div class="col-md-5 movie-content">';
                div += '<h2 class="text-primary"><b>' + movie.title + '</b></h2>';
                div += '<p class="text-info">';
                div += '<b>Release date:</b> ' + movie.release_date;
                div += '<b> || Popularity:</b> ' + movie.popularity.toFixed(2);
                div += ' <b> || User vote:</b> ' + movie.vote_average;
                div += '</p><p><b>Description:</b></p>';
                div += '<p>' + movie.overview + '</p>';
                div += '<button movie="' + movie.id + '" key="null" type="button" class="btn btn-warning trailerBtn">';
                div += '<span class="glyphicon glyphicon-play" aria-hidden="true"></span>';
                div += ' Watch trailer</button> ';
                div += '<button movie="' + movie.id + '" key="null" type="button" class="btn btn-primary shareBtn">';
                div += '<span><img src="images/facebook.png" width="14" height="14"></span>';
                div += ' Share on Facebook</button></div>';
                div += '<div class="col-md-4 movie-backdrop">';
                div += '<img src="http://image.tmdb.org/t/p/w500' + movie.backdrop_path + '" width="370" height="300">';
                div += '</div></div>';
                $('#results').append(div);
            });
            hideLoadingIcon();
        },
        error: function (xhr, status, error) {
            hideLoadingIcon();
            alert(error);
        }
    });
}
/*
* Call themoviedb.org API to get trailer
*/
$('body').on('click', '.trailerBtn', function (e) {
    var btn = $(this);
    var id = btn.attr('movie');
    var key = btn.attr('key');
    if (key == 'null') {
        var params = {
            // Request parameters
            "api_key": "d2d687a6e5d66a89ab03cd29621cb432",
            "append_to_response": "trailers"
        };
        $.ajax({
            url: 'http://api.themoviedb.org/3/movie/'
                + id + '/videos?' + $.param(params),
            type: 'GET',
            dataType: 'json',
            processData: false,
            beforeSend: function (xhr) {
                showLoadingIcon();
            },
            success: function (data) {
                var results;
                results = data['results'];
                $('#myModalHeader').text('Movie trailer');
                $('#myModalBody').html('<iframe width="560" height="350" src="https://www.youtube.com/embed/' +
                    results[0].key + '" frameborder="0" allowfullscreen></iframe>');
                $('#myModal').modal('show');
                btn.attr('key', results[0].key);
                hideLoadingIcon();
            },
            error: function (xhr, status, error) {
                hideLoadingIcon();
                alert(error);
            }
        });
    }
    else {
        $('#myModalHeader').text('Movie trailer');
        $('#myModalBody').html('<iframe width="560" height="350" src="https://www.youtube.com/embed/' +
            key + '" frameborder="0" allowfullscreen></iframe>');
        $('#myModal').modal('show');
    }
});
/*
* Share to facebook
*/
// Hide the default button
$('body').on('click', '.shareBtn', function (e) {
    var btn = $(this);
    var id = btn.attr('movie');
    var key = btn.attr('key');
    if (key == 'null') {
        var params = {
            // Request parameters
            "api_key": "d2d687a6e5d66a89ab03cd29621cb432"
        };
        $.ajax({
            url: 'http://api.themoviedb.org/3/movie/'
                + id + '?' + $.param(params),
            type: 'GET',
            dataType: 'json',
            processData: false,
            beforeSend: function (xhr) {
                showLoadingIcon();
            },
            success: function (data) {
                btn.attr('key', data.imdb_id);
                var str = '<a id="' + id + '" class="facebook" target="" ' +
                    'onclick="return !window.open(this.href, \'Facebook\', \'width=640,height=300\')" ' +
                    'href="http://www.facebook.com/sharer/sharer.php?u=http://www.imdb.com/title/' +
                    data.imdb_id + '">‌​Facebook</a>';
                btn.parent().append(str);
                $('#' + id).trigger('click');
                hideLoadingIcon();
            },
            error: function (xhr, status, error) {
                hideLoadingIcon();
                alert(error);
            }
        });
    }
    else {
        $('#' + id).trigger('click');
    }
});
