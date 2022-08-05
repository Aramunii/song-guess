$(function () {

    var lyrics;
    var line;
    var song;
    var songsname = [];
    var artists = [];
    var tries = 1;
    var tries_guess = [];
    var all_artists = [];
    var all_songs_mid = [];

    var selectedMusics = [];
    var selectedMidi = [];
    var selectedArtist = [];
    var gameMusics = [];
    var difficult = 0;
    var song_count = 0;
    var correct_count = 0;
    var selectedArtistName = '';
    var totalTimePlayed = 0;

    var SelectMenu = $('#selectMenu');
    var GamePlay = $('#gameContent');
    var GamePlayMidi = $('#gameContentMidi');
    var Difficult = $('#dificultSelect');
    var EndGame = $('#endGame');
    var GameMode = $('#gameMode');
    var gamemode = '';


    async function fetchArtists() {
        await fetch('https://aramunii.github.io/song-guess/data.json').then(function (response) {
            // The API call was successful!
            return response.text();
        }).then(async function (html) {
            all_artists = JSON.parse(html);
        });

        await fetch('https://aramunii.github.io/song-guess/dataSong.json').then(function (response) {
            // The API call was successful!
            return response.text();
        }).then(async function (html) {
            all_songs_mid = JSON.parse(html);
        });
    }

    fetchArtists();

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

    $('#revealButtonMidi').on('click', function () {
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
                    if (gamemode == 'letter') {
                        gameMusics[difficult - 1].lines = tries;
                    }
                    if (gamemode == 'midi') {
                        gameMusics[difficult - 1].time = totalTimePlayed;
                    }

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
                    if (gamemode == 'midi') {
                        gameMusics[difficult - 1].time = totalTimePlayed;
                    }
                    if (gamemode == 'letter') {
                        gameMusics[difficult - 1].lines = tries;
                    }
                    newSong();
                }
            });
        }

    }

    function newSong() {
        if (gamemode == 'letter') {
            tries = 1;
            $('#lines_tries').text(tries);
            $('#lyrics').empty();
            $('#tries').empty();
            $('#guess').val('');
            difficult--;
            if (difficult >= 1) {
                getLyric(gameMusics[difficult - 1])
            } else {
                endGame();
            }
        } else if (gamemode == 'midi') {
            totalTimePlayed = 0;
            $('#tries').empty();
            $('#guessMidi').val('');
            difficult--;
            if (difficult >= 1) {
                getMidi(gameMusics[difficult - 1])
            } else {
                endGame();
            }
        }

    }

    function endGame() {
        $('#artist_title').text(selectedArtistName);
        $('#count_play').text(`${correct_count}/${song_count}`)
        if (gamemode == 'letter') {
            gameMusics.forEach(song => {
                var emoji = song.correct ? '&#9989;' : '&#10060;'
                $('#answers').append(`<li >${song.title} - ${emoji} - Linhas: ${song.lines}</li>`)
            })
        } else if (gamemode == 'midi') {
            gameMusics.forEach(song => {
                var emoji = song.correct ? '&#9989;' : '&#10060;'
                $('#answers').append(`<li >${song.title} - ${song.time}s - ${emoji}</li>`)
            })
        }

        GamePlay.hide(300);
        GamePlayMidi.hide(300);
        EndGame.show(300);

    }

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

    async function startGameLetter() {
        Difficult.hide(300);
        getLyric(gameMusics[difficult - 1])
        GamePlay.show(300);
    }

    async function startGameMidi() {
        Difficult.hide(300);
        console.log(gameMusics);
        console.log(difficult);
        getMidi(gameMusics[difficult - 1])
        GamePlayMidi.show(300);
    }

    async function getMidi(song) {
        console.log(song);
        setMusic(song.link);
    }

    async function setMusic(url) {
        $("#jquery_jplayer_2").jPlayer("destroy");
        myPlayer = new CirclePlayer("#jquery_jplayer_2",
            {
                m4a: url,
            }, {
            cssSelectorAncestor: "#cp_container_2"
        });

        myPlayer.player.bind($.jPlayer.event.timeupdate, function (event) {
            totalTimePlayed = event.jPlayer.status.currentTime;
            $('.timeMidi').text(totalTimePlayed);
        })
    }


    $('#guessMidi').on('click', function () {
        myPlayer.player.jPlayer('pause')
    })

    $('#revealButtonMidi').on('click', function () {
        myPlayer.player.jPlayer('pause')
    })

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

        selectedArtist = all_artists.filter(artist => {
            if (artist.name.toUpperCase() == input) {
                return artist;
            }
        })

        selectedMidi = all_songs_mid.filter(song => {
            if (song.artist.toUpperCase().includes(input)) {
                return song
            }
        })

        setModes();

        if (input != '' && selectedMidi.length > 0 || input != '' && selectedArtist.length > 0) {

            GameMode.show(500);
        } else {
            Swal.fire({
                title: `Ocorreu um erro ao carregar músicas deste artista`,
                icon: 'error',
                confirmButtonText: 'Ok'
            }).then((result) => {
                if (result.isConfirmed) {
                }
            });
        }

    })

    async function setModes() {

        if (selectedMidi.length > 0) {
            $('#startMidi').show();
        } else {
            $('#startMidi').hide();
        }

        if (selectedArtist.length > 0) {
            selectedArtistName = selectedArtist[0].name;
            await getMusics(selectedArtist[0]);
            $('#startLetter').show();
        } else {
            $('#startLetter').hide();
        }

    }


    $('#startMidi').on('click', function () {
        gamemode = 'midi';
        SelectMenu.hide(500);
        Difficult.show(500);
        GameMode.hide(500);

    });

    $('#startLetter').on('click', function () {
        gamemode = 'letter';
        SelectMenu.hide(500);
        Difficult.show(500);
        GameMode.hide(500);

    })



    $('#randomButton').on('click', function () {
        const random = Math.floor(Math.random() * all_artists.length);
        $('#selectArtists').val(all_artists[random].name);
    });

    $('.start-game').on('click', function () {
        difficult = parseInt($(this).text());

        if (gamemode == 'letter') {
            song_count = difficult;
            gameMusics = selectedMusics.sort(() => Math.random() - Math.random()).slice(0, difficult)
            gameMusics = gameMusics.map(music => {
                return { title: music.title, link: music.link, correct: false, lines: 1 }
            })
            song_count = gameMusics.length;
            difficult = song_count;
            startGameLetter();
            selectedMusics.forEach(option => {
                $('#guessList').append(` <option value="${option.title}">
        </option>`)
            })
        } else if (gamemode == 'midi') {
            song_count = difficult;
            gameMusics = selectedMidi.sort(() => Math.random() - Math.random()).slice(0, difficult)
            gameMusics = gameMusics.map(music => {
                return { title: music.title, link: music.link, correct: false, time: 0 }
            })

            song_count = gameMusics.length;
            difficult = song_count;
            selectedMusics.forEach(option => {
                var contains = selectedMidi.filter(song => {
                    if (option.title.toUpperCase().includes(song.title.toUpperCase())) {
                        return true;
                    }
                })
                if (contains.length == 0) {
                    $('#guessListMidi').append(` <option value="${option.title}">
                    </option>`)
                }
            })

            selectedMidi.forEach(option => {
                $('#guessListMidi').append(` <option value="${option.title}">
        </option>`)
            })
            startGameMidi();
        }

    })

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
        $('#guess').val('')
    })


    $('#guessButtonMidi').on('click', function () {
        var guess = $('#guessMidi').val().toUpperCase();
        var song = gameMusics[difficult - 1];
        console.log(song.title.toUpperCase())
        console.log(guess)

        if (guess == song.title.toUpperCase()) {
            nextSong('success');
        } else {
            $('#triesMidi').append(`<p>${guess}</p>`)
            var objDiv = document.getElementById("tries");
            objDiv.scrollTop = objDiv.scrollHeight;
        }
        $('#guess').val('')
    })

    $(".share").on('click', function () {
        window.location.reload();
    });
})
