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
    $('#results').html('');
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
* Call Microsoft Face Detect API
*/
$('#askBtn').click(function (e: Event) {
    $('#resultOfFaceApi').html('');
    $('#results').html('');
    var input = <HTMLInputElement>$('#fileUpload')[0];
    if (!input.files[0]) {
        alert('Please choose a image.');
        return;
    }
    var params = {
        // Request parameters
        "returnFaceId": "true",
        "returnFaceLandmarks": "false",
        "returnFaceAttributes": "age,gender",
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
                alert('Cannot detect any faces in this image, please choose another image');
                hideLoadingIcon();
                return;
            }
            var str = '<ul id="resultOfFaceApi">';
            str += '<li>Found ' + data.length + ' person(s)</li>';
            var count = 1;
            data.forEach(element => {
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
        error: function (xhr: JQueryXHR, status: string, error: string) {
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
    } else {
        $('#myModalBody').html('');
    }
})

/*
* Calculate genres based on face attributes 
*/
function calculateGenres(faces: Array<Face>) {
    var genres: string;
    if (faces.length == 1) { // One people case
        if (faces[0].faceAttributes.age <= 12) { // Young
            genres = '16,878'; // Animation, Science Fiction
        } else if (faces[0].faceAttributes.age <= 18) { // Adult
            genres = '28|12|35|878'; // Action, Adventure, Comedy, Science Fiction
        } else if (faces[0].faceAttributes.age <= 45) {// Middle
            genres = '28|12|16|35|80|99|18|14|36|27|9648|10749|878|53|10752'; // All genre
        } else { // Older
            genres = '10752|10749|36|18'; // War, Romance, History, Drama
        }
    } else if (faces.length == 2) { // Two people case
        var person1 = faces[0];
        var person2 = faces[1];
        var sameGender = person1.faceAttributes.gender == person2.faceAttributes.gender;
        var areAdult = person1.faceAttributes.age >= 16 && person2.faceAttributes.age >= 16;
        var ageAbsolute = Math.abs(person1.faceAttributes.age - person2.faceAttributes.age);
        if (!sameGender && areAdult && ageAbsolute <= 9) { // Couple case
            genres = '35|18|10749|53'; // Comedy, Drama, Romance, Thriller
        } else if (!areAdult) { // Has children case
            genres = '16,28|12|878'; // Action, Adventure, Animation, Science Fiction
        } else { // Other cases like friend, family etc
            genres = '28|12|16|35|80|99|18|14|36|27|9648|10749|878|53|10752'; // All genre
        }
    } else if (faces.length > 2) { // Group of people case
        var under16 = false;
        faces.forEach(face => {
            if (face.faceAttributes.age < 16) {
                under16 = true;
            }
        });
        if (under16) { // Has children in group
            genres = '16,28|12|878'; // Action, Adventure, Animation, Science Fiction
        } else { // Maybe group of friend
            genres = '9648|27'; // Mystery, Horror (It is fun to watch in group)
        }
    }
    return genres;
}

/*
* Define Fovie class
*/
class Movie {
    id: number;
    title: string;
    release_date: string;
    poster_path: string;
    overview: string;
    popularity: number;
    vote_average: number;
    backdrop_path: string;
    key: string;
    site: string;
    constructor(i: number, t: string, d: string, p: string, o: string,
        po: number, v: number, b: string, k: string, s: string) {
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
    }
}
var movies = Array<Movie>();

/*
* Call themoviedb.org API
*/
function callThemovieDB(genres: string) {
    var params = {
        // Request parameters
        "api_key": "d2d687a6e5d66a89ab03cd29621cb432",
        "with_genres": genres,
    };
    $.ajax({
        url: 'http://api.themoviedb.org/3/discover/movie?' + $.param(params),
        type: 'GET',
        dataType: 'json',
        processData: false,
        beforeSend: function (xhr: JQueryXHR) {
            showLoadingIcon();
        },
        success: function (data) {
            movies = data['results'];
            movies.forEach(movie => {
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
                div += '<button id="' + movie.id + '" key="null" type="button" class="btn btn-warning trailerBtn">';
                div += '<span class="glyphicon glyphicon-play" aria-hidden="true"></span>';
                div += 'Watch trailer</button></div>';
                div += '<div class="col-md-4 movie-backdrop">';
                div += '<img src="http://image.tmdb.org/t/p/w500' + movie.backdrop_path + '" width="370" height="300">';
                div += '</div></div>';
                $('#results').append(div);
            });
            hideLoadingIcon();
        },
        error: function (xhr: JQueryXHR, status: string, error: string) {
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
    var id = btn.attr('id');
    var key = btn.attr('key');
    if (key == 'null') {
        var params = {
            // Request parameters
            "api_key": "d2d687a6e5d66a89ab03cd29621cb432",
            "append_to_response": "trailers",
        };
        $.ajax({
            url: 'http://api.themoviedb.org/3/movie/'
            + id + '/videos?' + $.param(params),
            type: 'GET',
            dataType: 'json',
            processData: false,
            beforeSend: function (xhr: JQueryXHR) {
                showLoadingIcon();
            },
            success: function (data) {
                var results: Movie;
                results = data['results'];
                $('#myModalHeader').text('Movie trailer');
                $('#myModalBody').html('<iframe width="560" height="350" src="https://www.youtube.com/embed/' +
                    results[0].key + '" frameborder="0" allowfullscreen></iframe>');
                $('#myModal').modal('show');
                btn.attr('key', results[0].key);
                hideLoadingIcon();
            },
            error: function (xhr: JQueryXHR, status: string, error: string) {
                hideLoadingIcon();
                alert(error);
            }
        });
    } else {
        $('#myModalHeader').text('Movie trailer');
        $('#myModalBody').html('<iframe width="560" height="350" src="https://www.youtube.com/embed/' +
            key + '" frameborder="0" allowfullscreen></iframe>');
        $('#myModal').modal('show');
    }
}); 