$(function () {

    var lyrics;
    var line;
    var song;
    var songsname = [];
    var artists = [];
    var tries = 1;
    var tries_guess = [];
    var all_artists = [];
    var selectedMusics = [];
    var gameMusics = [];
    var difficult = 0;
    var song_count = 0;
    var correct_count = 0;
    var selectedArtistName = '';

    var SelectMenu = $('#selectMenu');
    var GamePlay = $('#gameContent');
    var Difficult = $('#dificultSelect');
    var EndGame = $('#endGame');


    async function teste() {
        var response = await fetch('https://aramunii.github.io/song-guess/data.json').then(function (response) {
            // The API call was successful!
            return response.text();
        }).then(async function (html) {
            all_artists = JSON.parse(html);
        });
    }

    teste();

    async function main() {
        // var response = await axios.get('https://www.vagalume.com.br/top100/musicas/original/2022/07/');

        var response = await fetch('https://www.vagalume.com.br/top100/musicas/original/2022/07/').then(function (response) {
            // The API call was successful!
            return response.text();
        }).then(async function (html) {
            // This is the HTML from our response as a text string
            console.log(html);
            const songsArray = $(html).find('.topSongs').toArray();

            var songs = []

            songsArray.forEach(song => {
                var title = $(song).find('a').text().replace('(tradução)', '').trim()
                var href = $(song).find('a').attr('href');
                var artist = $(song).find('.styleBlack').text().trim()
                songs.push({ title: title, artist: artist, href: href })

                if (!songsname.includes(title)) {
                    songsname.push(title);
                }

                if (!artists.includes(artist)) {
                    artists.push(artist);
                }
            })

            autocompl = songsname.concat(artists);

            autocompl.forEach(option => {
                $('#guessList').append(` <option value="${option}">
        </option>`)
            })

            // autocomplete(document.getElementById("guess"), autocompl);

            const random = Math.floor(Math.random() * songs.length);
            song = songs[random];

            var href = song.href.replace('-traducao', '');
            href = href.replace('traducao', '');
            await getLyric(href);
        }).catch(function (err) {
            // There was an error
            console.warn('Something went wrong.', err);
        });

        console.log(response);


    }

    // main();

    async function getLyric(href) {
        console.log(href);
        if (typeof href == 'undefined') {
            Swal.fire({
                title: `Ocorreu um erro ao carregar músicas`,
                icon: 'error',
                confirmButtonText: 'Reiniciar'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.reload()
                }
            });
        }
        var link = href.link.replace('-traduccion', '');
        link = link.replace('traduccion', '');
        link.replace('-traducao', '');
        link.replace('traducao', '');
        var response = await fetch('https://www.vagalume.com.br' + link).then(function (response) {
            // The API call was successful!
            return response.text();
        }).then(function (html) {
            // This is the HTML from our response as a text string
            console.log(html);
            var lyric = $(html).find('#lyrics').html();
            var lyric = lyric.replace('<br><br>', '<br>');
            lyrics = lyric.split('<br>');

            lyrics = lyrics.filter(line => {
                if (line != '') {
                    return line;
                }
            });

            line = Math.floor(Math.random() * lyrics.length);
            // console.log(lyric);
            $('#lyrics').append(`<p class="text-default">${lyrics[line]}</p>`)
            console.log(lyrics[line]);
        }).catch(function (err) {
            // There was an error
            console.warn('Something went wrong.', err);
        });

    }

    $('#newLine').on('click', function () {
        line++;
        $('#lyrics').append(`<p>${lyrics[line]}</p>`)
        console.log(lyrics[line]);
    })



    $('#revealButton').on('click', function () {
        nextSong('info');
    });

    function nextSong(icon) {
        var song = gameMusics[difficult - 1];
        if (icon == 'success') {
            Swal.fire({
                title: `Você acertou!`,
                icon: icon,
                confirmButtonText: 'Proxíma música'
            }).then((result) => {
                if (result.isConfirmed) {
                    correct_count++;
                    gameMusics[difficult - 1].correct = true;
                    newSong();
                }
            });
        } else {
            Swal.fire({
                title: `Música: ${song.title}`,
                icon: icon,
                confirmButtonText: 'Proxíma música'
            }).then((result) => {
                if (result.isConfirmed) {
                    newSong();
                }
            });
        }

    }

    function newSong() {
        tries = 1;
        $('#lines_tries').text(tries);
        $('#lyrics').empty();
        $('#tries').empty();
        $('#guess').val('');
        difficult--;
        if (difficult >= 1) {
            console.log(difficult - 1);
            getLyric(gameMusics[difficult - 1])
        } else {
            Swal.fire({
                title: `Fim de Jogo`,
                icon: 'info',
                confirmButtonText: 'Novo Jogo'
            }).then((result) => {
                if (result.isConfirmed) {
                    console.log(gameMusics);
                    console.log(selectedArtistName);
                    // window.location.reload();
                    endGame();
                }
            });
        }
    }

    function endGame() {
        $('#artist_title').text(selectedArtistName);
        $('#count_play').text(`${correct_count}/${song_count}`)
        gameMusics.forEach(song => {
            var emoji = song.correct ? '&#9989;' : '&#10060;'
            $('#answers').append(`<li >${song.title} ${emoji}</li>`)
        })
        GamePlay.hide(300);
        EndGame.show(300);

    }

    $('#selectArtists').on('input', function () {
        // do something
        var input = $(this).val().toUpperCase();
        var newArtists = all_artists.filter(artist => {
            if (artist.name.toUpperCase().includes(input)) {
                return artist.name;
            }
        })

        if (newArtists.length < 200) {
            $('#artists').empty();
            newArtists.forEach(option => {
                $('#artists').append(`<option value="${option.name}">
        </option>`)
            })
        }
    });

    $('#selectButton').on('click', async function () {
        var input = $('#selectArtists').val().toUpperCase();
        var selectedArtist = all_artists.filter(artist => {
            if (artist.name.toUpperCase() == input) {
                return artist;
            }
        })
        if (selectedArtist.length == 0) {
            Swal.fire({
                title: `Artista não encontrado!`,
                html: ``,
                icon: 'error',
                confirmButtonText: 'Ok'
            })
        } else {


            selectedArtistName = selectedArtist[0].name;
            await getMusics(selectedArtist[0]);
            SelectMenu.hide(500);
            Difficult.show(500);
        }
    })

    async function getMusics(selectedArtist) {
        var response = await fetch('https://www.vagalume.com.br' + selectedArtist.link).then(function (response) {
            // The API call was successful!
            return response.text();
        }).then(async function (html) {
            const songsArray = $(html).find('#alfabetMusicList').find('li').toArray();
            selectedMusics = songsArray.map(song => {
                var title = $(song).find('.nameMusic').text();
                var link = $(song).find('.nameMusic').attr('href');
                return { title: title, link: link }
            })
        });
    }

    $('#randomButton').on('click', function () {
        const random = Math.floor(Math.random() * all_artists.length);
        $('#selectArtists').val(all_artists[random].name);
    });

    $('.start-game').on('click', function () {
        difficult = parseInt($(this).text());
        song_count = difficult;
        gameMusics = selectedMusics.sort(() => Math.random() - Math.random()).slice(0, difficult)
        gameMusics = gameMusics.map(music => {
            return { title: music.title, link: music.link, correct: false }
        })

        startGame();

        selectedMusics.forEach(option => {
            $('#guessList').append(` <option value="${option.title}">
    </option>`)
        })

    })

    async function startGame() {
        Difficult.hide(300);
        getLyric(gameMusics[difficult - 1])
        GamePlay.show(300);
    }

    $('#guessButton').on('click', function () {
        var guess = $('#guess').val().toUpperCase();
        var song = gameMusics[difficult - 1];
        if (guess == song.title.toUpperCase()) {
            nextSong('success');
        } else {
            line++;
            tries++;
            if (line >= lyrics.length) {
                line = 0;
            }
            $('#lyrics').append(`<p class="text-default">${lyrics[line]}</p>`)
            var objDiv = document.getElementById("lyrics");
            objDiv.scrollTop = objDiv.scrollHeight;
            $('#lines_tries').text(tries);
            $('#tries').append(`<p>${guess}</p>`)
            var objDiv = document.getElementById("tries");
            objDiv.scrollTop = objDiv.scrollHeight;
        }
    })



    function autocomplete(inp, arr) {
        /*the autocomplete function takes two arguments,
        the text field element and an array of possible autocompleted values:*/
        var currentFocus;
        /*execute a function when someone writes in the text field:*/
        inp.addEventListener("input", function (e) {
            var a, b, i, val = this.value;
            /*close any already open lists of autocompleted values*/
            closeAllLists();
            if (!val) { return false; }
            currentFocus = -1;
            /*create a DIV element that will contain the items (values):*/
            a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            /*append the DIV element as a child of the autocomplete container:*/
            this.parentNode.appendChild(a);
            /*for each item in the array...*/
            for (i = 0; i < arr.length; i++) {
                /*check if the item starts with the same letters as the text field value:*/
                if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                    /*create a DIV element for each matching element:*/
                    b = document.createElement("DIV");
                    /*make the matching letters bold:*/
                    b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                    b.innerHTML += arr[i].substr(val.length);
                    /*insert a input field that will hold the current array item's value:*/
                    b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                    /*execute a function when someone clicks on the item value (DIV element):*/
                    b.addEventListener("click", function (e) {
                        /*insert the value for the autocomplete text field:*/
                        inp.value = this.getElementsByTagName("input")[0].value;
                        /*close the list of autocompleted values,
                        (or any other open lists of autocompleted values:*/
                        closeAllLists();
                    });
                    a.appendChild(b);
                }
            }
        });
        /*execute a function presses a key on the keyboard:*/
        inp.addEventListener("keydown", function (e) {
            var x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) {
                /*If the arrow DOWN key is pressed,
                increase the currentFocus variable:*/
                currentFocus++;
                /*and and make the current item more visible:*/
                addActive(x);
            } else if (e.keyCode == 38) { //up
                /*If the arrow UP key is pressed,
                decrease the currentFocus variable:*/
                currentFocus--;
                /*and and make the current item more visible:*/
                addActive(x);
            } else if (e.keyCode == 13) {
                /*If the ENTER key is pressed, prevent the form from being submitted,*/
                e.preventDefault();
                if (currentFocus > -1) {
                    /*and simulate a click on the "active" item:*/
                    if (x) x[currentFocus].click();
                }
            }
        });
        function addActive(x) {
            /*a function to classify an item as "active":*/
            if (!x) return false;
            /*start by removing the "active" class on all items:*/
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            /*add class "autocomplete-active":*/
            x[currentFocus].classList.add("autocomplete-active");
        }
        function removeActive(x) {
            /*a function to remove the "active" class from all autocomplete items:*/
            for (var i = 0; i < x.length; i++) {
                x[i].classList.remove("autocomplete-active");
            }
        }
        function closeAllLists(elmnt) {
            /*close all autocomplete lists in the document,
            except the one passed as an argument:*/
            var x = document.getElementsByClassName("autocomplete-items");
            for (var i = 0; i < x.length; i++) {
                if (elmnt != x[i] && elmnt != inp) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }
        }
        /*execute a function when someone clicks in the document:*/
        document.addEventListener("click", function (e) {
            closeAllLists(e.target);
        });
    }

    $(".share").on('click', function () {
        window.location.reload();
    });
})
