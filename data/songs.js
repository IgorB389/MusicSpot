// data/songs.js

export const albums = [
  {
    id: 'album1',
    title: 'Album Zielony',
    cover: require('../covers/cover1.jpg'),
    songs: [
      {
        id: '01 - JESZCZE RAZ',
        title: '01 - JESZCZE RAZ',
        file: require('../music/01 - JESZCZE RAZ.mp3'),
        cover: require('../covers/cover1.jpg'),
      },
      {
        id: '02 - KLASA BIZNES',
        title: '02 - KLASA BIZNES',
        file: require('../music/02 - KLASA BIZNES.mp3'),
        cover: require('../covers/cover1.jpg'),
      },
      {
        id: '03 - DRIP CHEAP GANG',
        title: '03 - DRIP CHEAP GANG',
        file: require('../music/03 - DRIP CHEAP GANG.mp3'),
        cover: require('../covers/cover1.jpg'),
      },
    ],
  },
  {
    id: 'album2',
    title: 'Album Fioletowy',
    cover: require('../covers/cover2.jpg'),
    songs: [
      {
        id: '04 - COWABONGA',
        title: '04 - COWABONGA',
        file: require('../music/04 - COWABONGA.mp3'),
        cover: require('../covers/cover2.jpg'),
      },
      {
        id: '05 - LOLA',
        title: '05 - LOLA',
        file: require('../music/05 - LOLA.mp3'),
        cover: require('../covers/cover2.jpg'),
      },
    ],
  },
];

export const otherSongs = [
  {
    id: '06 - JOHNNY DANG',
    title: '06 - JOHNNY DANG',
    file: require('../music/06 - JOHNNY DANG.mp3'),
    cover: require('../covers/cover3.jpg'),
  },
  {
    id: '07 - APOLLO 13',
    title: '07 - APOLLO 13',
    file: require('../music/07 - APOLLO 13.mp3'),
    cover: require('../covers/cover4.jpg'),
  },
  {
    id: '08 - PRZEKAZ MYŚLI',
    title: '08 - PRZEKAZ MYŚLI',
    file: require('../music/08 - PRZEKAZ MYŚLI.mp3'),
    cover: require('../covers/cover5.jpg'),
  },
  {
    id: '09 - FUTURE TRUNKS',
    title: '09 - FUTURE TRUNKS',
    file: require('../music/09 - FUTURE TRUNKS.mp3'),
    cover: require('../covers/cover6.jpg'),
  },
  {
    id: '10 - TORNADO',
    title: '10 - TORNADO',
    file: require('../music/10 - TORNADO.mp3'),
    cover: require('../covers/cover7.jpg'),
  },
  {
    id: '11 - I00',
    title: '11 - I00',
    file: require('../music/11 - I00.mp3'),
    cover: require('../covers/cover8.jpg'),
  },
  {
    id: '12 - MAGIC CITY',
    title: '12 - MAGIC CITY',
    file: require('../music/12 - MAGIC CITY.mp3'),
    cover: require('../covers/cover9.jpg'),
  },
  {
    id: '13 - RAVE',
    title: '13 - RAVE',
    file: require('../music/13 - RAVE.mp3'),
    cover: require('../covers/cover10.jpg'),
  },
  {
    id: '14 - HERE WE GO',
    title: '14 - HERE WE GO',
    file: require('../music/14 - HERE WE GO.mp3'),
    cover: require('../covers/cover11.jpg'),
  },
  {
    id: '15 - JEZUS',
    title: '15 - JEZUS',
    file: require('../music/15 - JEZUS.mp3'),
    cover: require('../covers/cover12.jpg'),
  },
    {
    id: 'Palo Santo - Miki i Brzdygi',
    title: 'Palo Santo - Miki i Brzdygi',
    file: require('../music/Palo Santo - Miki i Brzdygi.mp3'),
    cover: require('../covers/pcover.jpg'),
  },
];

// Funkcja pomocnicza do pobrania wszystkich utworów
export const getAllSongs = () => {
  const albumSongs = albums.flatMap(album => album.songs);
  return [...albumSongs, ...otherSongs];
};

// Funkcja do wyszukiwania utworów
export const searchSongs = (query) => {
  const allSongs = getAllSongs();
  return allSongs.filter(song => 
    song.title.toLowerCase().includes(query.toLowerCase())
  );
};