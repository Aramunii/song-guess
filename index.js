const axios = require('axios');
const cheerio = require('cheerio');

async function main() {

    var response = await axios.get('https://www.vagalume.com.br/top100/musicas/original/2022/07/');
    const $ = cheerio.load(response.data);

    const songsArray = $('.topSongs').toArray();

    var songs = []

    songsArray.forEach(song => {
        var title = $(song).find('a').text()
        var href = $(song).find('a').attr('href');
        var artist = $(song).find('.styleBlack').text()
        songs.push({ title: title, artist: artist,href: href })
    })

    const random = Math.floor(Math.random() * songs.length);
    console.log(songs[random]);
    var song = songs[random];
    
    var href = song.href.replace('-traducao','');
    href = href.replace('traducao','');
    var teste = await getLyric(href);

}

async function getLyric(href)
{
    var response  = await axios.get('https://www.vagalume.com.br' + href);
    const $ = cheerio.load(response.data);
    console.log(response);

    var lyric = $('#lyrics').html();
    var lyric = lyric.replace('<br><br>','<br>');
    var lyrics = lyric.split('<br>');

    lyrics = lyrics.filter(line=>{
        if(line != '')
        {
            return line;
        }
    });

    const random = Math.floor(Math.random() * lyrics.length);
    // console.log(lyric);
    console.log(lyrics[random]);
}


main();