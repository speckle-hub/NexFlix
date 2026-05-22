// TMDB API Service and Demo Mode Fallback Data Source
// Coordinates live HTTP requests vs. premium mock cinema data automatically.

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

// 20+ Real Cinema Masterpieces Database for Demo Mode
const MOCK_ITEMS = [
  {
    id: 157336,
    title: "Interstellar",
    type: "movie",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/2ssWTSVklAEc98frZUQhgtGHx7s.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    vote_average: 8.4,
    release_date: "2014-11-05",
    runtime: 169,
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    original_language: "en",
    genres: ["Adventure", "Drama", "Science Fiction"],
    popularity: 145.2,
    adult: false,
    tag: "🏆 Oscar Winner",
    live: false,
    newRelease: false,
    cast: [
      { name: "Matthew McConaughey", character: "Cooper", profile_path: "/6O0s4w2yq7e3g5xU5A3B3w7eD9c.jpg" },
      { name: "Anne Hathaway", character: "Brand", profile_path: "/7DNGs1g0L9B749jO76v0O80a0gU.jpg" },
      { name: "Jessica Chastain", character: "Murph", profile_path: "/cvO5Oc23WmhF6H3hS8x2g09E6gB.jpg" },
      { name: "Michael Caine", character: "Professor Brand", profile_path: "/y445vPj9hXJjA348U3D1l4v2k0n.jpg" }
    ],
    crew: [
      { name: "Christopher Nolan", job: "Director" },
      { name: "Jonathan Nolan", job: "Writer" },
      { name: "Hans Zimmer", job: "Composer" }
    ],
    videos: { results: [{ key: "zSWdZAjdHVw", site: "YouTube", type: "Trailer" }] },
    reviews: {
      results: [
        { author: "CinematicMaster", content: "A grand, emotional epic that pushes the boundaries of sci-fi. Hans Zimmer's organ-heavy score is absolutely monumental.", rating: 10 },
        { author: "SciFiLover", content: "Visual effects are breathtaking. The relationship between Cooper and Murph is the emotional anchor that makes the scientific theories hit home.", rating: 9 }
      ]
    }
  },
  {
    id: 27205,
    title: "Inception",
    type: "movie",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
    vote_average: 8.3,
    release_date: "2010-07-15",
    runtime: 148,
    tagline: "Your mind is the scene of the crime.",
    original_language: "en",
    genres: ["Action", "Science Fiction", "Adventure"],
    popularity: 132.8,
    adult: false,
    tag: "🔥 Trending #1",
    live: true,
    newRelease: false,
    cast: [
      { name: "Leonardo DiCaprio", character: "Cobb", profile_path: "/wo2hJv010n0BjZg010n0BjZg.jpg" },
      { name: "Joseph Gordon-Levitt", character: "Arthur", profile_path: "/JosephGL.jpg" },
      { name: "Elliot Page", character: "Ariadne", profile_path: "/ElliotP.jpg" },
      { name: "Tom Hardy", character: "Eames", profile_path: "/TomHardy.jpg" }
    ],
    crew: [
      { name: "Christopher Nolan", job: "Director" },
      { name: "Christopher Nolan", job: "Writer" },
      { name: "Hans Zimmer", job: "Composer" }
    ],
    videos: { results: [{ key: "YoHD9XEInc0", site: "YouTube", type: "Trailer" }] },
    reviews: {
      results: [
        { author: "DreamWeaver", content: "A brilliant heist movie set inside the human mind. Truly mind-bending with jaw-dropping practical action sequences.", rating: 10 }
      ]
    }
  },
  {
    id: 66732,
    name: "Stranger Things",
    type: "tv",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg",
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    vote_average: 8.6,
    first_air_date: "2016-07-15",
    tagline: "One summer can change everything.",
    original_language: "en",
    genres: ["Drama", "Sci-Fi & Fantasy", "Mystery"],
    popularity: 210.4,
    adult: false,
    tag: "📺 Global Sensation",
    live: true,
    newRelease: false,
    cast: [
      { name: "Millie Bobby Brown", character: "Eleven", profile_path: "/MillieBB.jpg" },
      { name: "Finn Wolfhard", character: "Mike Wheeler", profile_path: "/FinnW.jpg" },
      { name: "Winona Ryder", character: "Joyce Byers", profile_path: "/WinonaR.jpg" },
      { name: "David Harbour", character: "Jim Hopper", profile_path: "/DavidH.jpg" }
    ],
    crew: [
      { name: "Matt Duffer", job: "Director" },
      { name: "Ross Duffer", job: "Director" },
      { name: "Kyle Dixon", job: "Composer" }
    ],
    videos: { results: [{ key: "b9EkMc79ZSU", site: "YouTube", type: "Trailer" }] },
    seasons: [
      {
        season_number: 1,
        name: "Season 1",
        episodes: [
          { episode_number: 1, name: "Chapter One: The Vanishing of Will Byers", runtime: 48, overview: "On his way home from a friend's house, young Will sees something terrifying. Nearby, a sinister secret lurks in the depths of a government lab.", still_path: "/56v2Kj2qLz32wrmyYKZldw6gD7U.jpg" },
          { episode_number: 2, name: "Chapter Two: The Weirdo on Maple Street", runtime: 55, overview: "Lucas, Mike and Dustin try to talk to the girl they found in the woods. Hopper questions an anxious Joyce about a phone call.", still_path: "/56v2Kj2qLz32wrmyYKZldw6gD7U.jpg" },
          { episode_number: 3, name: "Chapter Three: Holly, Jolly", runtime: 51, overview: "An increasingly concerned Nancy looks for Barb and finds out Jonathan's been taking pictures. Joyce is convinced Will is talking to her.", still_path: "/56v2Kj2qLz32wrmyYKZldw6gD7U.jpg" }
        ]
      },
      {
        season_number: 2,
        name: "Season 2",
        episodes: [
          { episode_number: 1, name: "Chapter One: MADMAX", runtime: 48, overview: "As the town prepares for Halloween, a high-scoring rival shakes up the arcade while Hopper inspects a field of rotting pumpkins.", still_path: "/56v2Kj2qLz32wrmyYKZldw6gD7U.jpg" }
        ]
      }
    ],
    reviews: {
      results: [
        { author: "80sRetroFan", content: "A brilliant homage to 80s cinema. Spielberg meets Stephen King in the best way possible. Eleven is an iconic character.", rating: 10 }
      ]
    }
  },
  {
    id: 693134,
    title: "Dune: Part Two",
    type: "movie",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
    vote_average: 8.5,
    release_date: "2026-02-27",
    runtime: 166,
    tagline: "Long live the fighters.",
    original_language: "en",
    genres: ["Science Fiction", "Adventure"],
    popularity: 289.5,
    adult: false,
    tag: "🆕 New Release",
    live: true,
    newRelease: true,
    cast: [
      { name: "Timothée Chalamet", character: "Paul Atreides", profile_path: "/lhC5W5lhC.jpg" },
      { name: "Zendaya", character: "Chani", profile_path: "/ZendayaC.jpg" },
      { name: "Rebecca Ferguson", character: "Lady Jessica", profile_path: "/RebeccaF.jpg" },
      { name: "Austin Butler", character: "Feyd-Rautha Harkonnen", profile_path: "/AustinB.jpg" }
    ],
    crew: [
      { name: "Denis Villeneuve", job: "Director" },
      { name: "Frank Herbert", job: "Novelist" },
      { name: "Hans Zimmer", job: "Composer" }
    ],
    videos: { results: [{ key: "Way9Dexny3o", site: "YouTube", type: "Trailer" }] },
    reviews: {
      results: [
        { author: "ArrakisDreamer", content: "An absolute masterclass in visual storytelling and sound design. Denis Villeneuve has created a sci-fi masterpiece for the ages.", rating: 10 }
      ]
    }
  },
  {
    id: 872585,
    title: "Oppenheimer",
    type: "movie",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/neeNHeXjMF5fXoCJRsOmkNGC7q.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    vote_average: 8.1,
    release_date: "2023-07-21",
    runtime: 180,
    tagline: "The world forever changes.",
    original_language: "en",
    genres: ["Drama", "History"],
    popularity: 118.4,
    adult: false,
    tag: "🏆 Oscar Winner",
    live: false,
    newRelease: false,
    cast: [
      { name: "Cillian Murphy", character: "J. Robert Oppenheimer", profile_path: "/CillianM.jpg" },
      { name: "Emily Blunt", character: "Kitty Oppenheimer", profile_path: "/EmilyB.jpg" },
      { name: "Matt Damon", character: "Leslie Groves", profile_path: "/MattD.jpg" },
      { name: "Robert Downey Jr.", character: "Lewis Strauss", profile_path: "/RDJ.jpg" }
    ],
    crew: [
      { name: "Christopher Nolan", job: "Director" },
      { name: "Christopher Nolan", job: "Writer" },
      { name: "Ludwig Göransson", job: "Composer" }
    ],
    videos: { results: [{ key: "uYPbbEGQyec", site: "YouTube", type: "Trailer" }] },
    reviews: {
      results: [
        { author: "HistoryBuff", content: "Intense, cerebral, and haunting. Cillian Murphy's performance is incredibly deep, and the Trinity test sequence will leave you speechless.", rating: 9 }
      ]
    }
  },
  {
    id: 155,
    title: "The Dark Knight",
    type: "movie",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/cfT29Im5VDvjE0RpyKOSdCKZal7.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
    vote_average: 8.5,
    release_date: "2008-07-16",
    runtime: 152,
    tagline: "Why So Serious?",
    original_language: "en",
    genres: ["Action", "Drama", "Crime"],
    popularity: 165.7,
    adult: false,
    tag: "⭐ All-Time Classic",
    live: false,
    newRelease: false,
    cast: [
      { name: "Christian Bale", character: "Bruce Wayne / Batman", profile_path: "/ChristianBale.jpg" },
      { name: "Heath Ledger", character: "The Joker", profile_path: "/HeathLedger.jpg" },
      { name: "Gary Oldman", character: "James Gordon", profile_path: "/GaryOldman.jpg" },
      { name: "Aaron Eckhart", character: "Harvey Dent", profile_path: "/AaronEckhart.jpg" }
    ],
    crew: [
      { name: "Christopher Nolan", job: "Director" },
      { name: "Jonathan Nolan", job: "Writer" },
      { name: "Hans Zimmer", job: "Composer" }
    ],
    videos: { results: [{ key: "EXeTwQWrcwY", site: "YouTube", type: "Trailer" }] },
    reviews: {
      results: [
        { author: "GothamWatcher", content: "Heath Ledger gave the performance of a lifetime. The absolute gold standard of comic book adaptations.", rating: 10 }
      ]
    }
  },
  {
    id: 100088,
    name: "The Last of Us",
    type: "tv",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/acevLdSl5I2MK5RYAm7gwAndt1w.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/dmo6TYuuJgaYinXBPjrgG9mB5od.jpg",
    overview: "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone. What starts as a small job soon becomes a brutal, heartbreaking journey, as they both must traverse the US and depend on each other for survival.",
    vote_average: 8.7,
    first_air_date: "2023-01-15",
    tagline: "When you're lost in the darkness, look for the light.",
    original_language: "en",
    genres: ["Drama", "Action & Adventure", "Sci-Fi & Fantasy"],
    popularity: 198.3,
    adult: false,
    tag: "🔥 Fan Favorite",
    live: true,
    newRelease: false,
    cast: [
      { name: "Pedro Pascal", character: "Joel Miller", profile_path: "/PedroPascal.jpg" },
      { name: "Bella Ramsey", character: "Ellie Williams", profile_path: "/BellaRamsey.jpg" },
      { name: "Gabriel Luna", character: "Tommy Miller", profile_path: "/GabrielLuna.jpg" }
    ],
    crew: [
      { name: "Craig Mazin", job: "Director" },
      { name: "Neil Druckmann", job: "Writer" },
      { name: "Gustavo Santaolalla", job: "Composer" }
    ],
    videos: { results: [{ key: "uLtkt8BonwM", site: "YouTube", type: "Trailer" }] },
    seasons: [
      {
        season_number: 1,
        name: "Season 1",
        episodes: [
          { episode_number: 1, name: "When You're Lost in the Darkness", runtime: 81, overview: "In 2003, a parasitic fungal outbreak sparks global panic. In 2023, smuggler Joel is tasked with transporting young Ellie.", still_path: "/2gd92m6e6SjS62g3D1l4v2k0nN5.jpg" },
          { episode_number: 2, name: "Infected", runtime: 53, overview: "Joel, Tess and Ellie navigate a deserted, flooded Boston hotel to escape infected zombies.", still_path: "/2gd92m6e6SjS62g3D1l4v2k0nN5.jpg" }
        ]
      }
    ],
    reviews: {
      results: [
        { author: "GamerCinema", content: "Finally, a video game adaptation done with absolute perfection. Pedro Pascal and Bella Ramsey have incredible chemistry.", rating: 10 }
      ]
    }
  },
  {
    id: 1396,
    name: "Breaking Bad",
    type: "tv",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
    overview: "When Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years to live, he becomes filled with a sense of fearlessness and an unrelenting desire to secure his family's financial future at any cost as he enters the dangerous world of drugs and crime.",
    vote_average: 8.9,
    first_air_date: "2008-01-20",
    tagline: "Change the Equation.",
    original_language: "en",
    genres: ["Drama", "Crime"],
    popularity: 180.2,
    adult: false,
    tag: "⭐ Best Rated TV",
    live: false,
    newRelease: false,
    cast: [
      { name: "Bryan Cranston", character: "Walter White", profile_path: "/BryanC.jpg" },
      { name: "Aaron Paul", character: "Jesse Pinkman", profile_path: "/AaronP.jpg" },
      { name: "Anna Gunn", character: "Skyler White", profile_path: "/AnnaG.jpg" },
      { name: "Bob Odenkirk", character: "Saul Goodman", profile_path: "/BobO.jpg" }
    ],
    crew: [
      { name: "Vince Gilligan", job: "Director" },
      { name: "Vince Gilligan", job: "Writer" },
      { name: "Dave Porter", job: "Composer" }
    ],
    videos: { results: [{ key: "HhesaQXLuRY", site: "YouTube", type: "Trailer" }] },
    seasons: [
      {
        season_number: 1,
        name: "Season 1",
        episodes: [
          { episode_number: 1, name: "Pilot", runtime: 58, overview: "Diagnosed with terminal cancer, a chemistry teacher teams up with a former student to cook meth.", still_path: "/9fa9R2w31nSgW6Z37R5VfPq0x6k.jpg" }
        ]
      }
    ],
    reviews: {
      results: [
        { author: "HeisenbergFan", content: "The greatest television show ever written. Masterful character development and pacing.", rating: 10 }
      ]
    }
  },
  {
    id: 569094,
    title: "Spider-Man: Across the Spider-Verse",
    type: "movie",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/9xfDWXAUbFXQK585JvByT5pEAhe.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    overview: "After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider-Society, a team of Spider-People charged with protecting the Multiverse’s very existence. But when the heroes clash on how to handle a new threat, Miles finds himself pitted against the other Spiders and must redefine what it means to be a hero so he can save the people he loves most.",
    vote_average: 8.4,
    release_date: "2023-05-31",
    runtime: 140,
    tagline: "It's how you wear the mask.",
    original_language: "en",
    genres: ["Animation", "Action", "Adventure", "Science Fiction"],
    popularity: 154.5,
    adult: false,
    tag: "🎨 Visual Marvel",
    live: false,
    newRelease: false,
    cast: [
      { name: "Shameik Moore", character: "Miles Morales / Spider-Man", profile_path: "/ShameikM.jpg" },
      { name: "Hailee Steinfeld", character: "Gwen Stacy / Spider-Woman", profile_path: "/HaileeS.jpg" },
      { name: "Oscar Isaac", character: "Miguel O'Hara / Spider-Man 2099", profile_path: "/OscarI.jpg" }
    ],
    crew: [
      { name: "Joaquim Dos Santos", job: "Director" },
      { name: "Phil Lord", job: "Writer" },
      { name: "Daniel Pemberton", job: "Composer" }
    ],
    videos: { results: [{ key: "cqGjhVJWtEg", site: "YouTube", type: "Trailer" }] },
    reviews: {
      results: [
        { author: "AnimationGeek", content: "Every single frame of this movie is an absolute piece of art. A revolutionary cinematic achievement in animation.", rating: 10 }
      ]
    }
  },
  {
    id: 94605,
    name: "Arcane",
    type: "tv",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/q8eejQcg1bAqImEV8jh8RtBD4uH.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/abf8tHznhSvl9BAElD2cQeRr7do.jpg",
    overview: "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of war between magic technologies and clashing convictions.",
    vote_average: 8.8,
    first_air_date: "2021-11-06",
    tagline: "Every legend has a beginning.",
    original_language: "en",
    genres: ["Animation", "Sci-Fi & Fantasy", "Action & Adventure"],
    popularity: 168.9,
    adult: false,
    tag: "🏆 Emmy Winner",
    live: true,
    newRelease: false,
    cast: [
      { name: "Hailee Steinfeld", character: "Vi", profile_path: "/HaileeS.jpg" },
      { name: "Ella Purnell", character: "Jinx", profile_path: "/EllaPurnell.jpg" },
      { name: "Kevin Alejandro", character: "Jayce Talis", profile_path: "/KevinAlejandro.jpg" }
    ],
    crew: [
      { name: "Christian Linke", job: "Creator" },
      { name: "Alex Yee", job: "Creator" },
      { name: "Alexander Temple", job: "Composer" }
    ],
    videos: { results: [{ key: "fXmAurhC9lw", site: "YouTube", type: "Trailer" }] },
    seasons: [
      {
        season_number: 1,
        name: "Season 1",
        episodes: [
          { episode_number: 1, name: "Welcome to the Playground", runtime: 43, overview: "Orphaned sisters Vi and Powder stir up trouble on the streets of Zaun after a heist in posh Piltover.", still_path: "/vB1DfbR7K3m5WwQ1y74N4s7D6Fv.jpg" }
        ]
      }
    ],
    reviews: {
      results: [
        { author: "LeagueMaster", content: "Whether you play the game or not, this is one of the best animated shows ever crafted. Beautiful, gritty, and incredibly deep.", rating: 10 }
      ]
    }
  },
  {
    id: 603,
    title: "The Matrix",
    type: "movie",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/tlm8UkiQsitc8rSuIAscQDCnP8d.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/aOIuZAjPaRIE6CMzbazvcHuHXDc.jpg",
    overview: "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground fighters who are fighting against the powerful computers who now rule the earth.",
    vote_average: 8.2,
    release_date: "1999-03-30",
    runtime: 136,
    tagline: "Free your mind.",
    original_language: "en",
    genres: ["Action", "Science Fiction"],
    popularity: 98.4,
    adult: false,
    tag: "⭐ Sci-Fi Pioneer",
    live: false,
    newRelease: false,
    cast: [
      { name: "Keanu Reeves", character: "Neo / Thomas Anderson", profile_path: "/KeanuR.jpg" },
      { name: "Laurence Fishburne", character: "Morpheus", profile_path: "/LaurenceF.jpg" },
      { name: "Carrie-Anne Moss", character: "Trinity", profile_path: "/CarrieM.jpg" },
      { name: "Hugo Weaving", character: "Agent Smith", profile_path: "/HugoW.jpg" }
    ],
    crew: [
      { name: "Lana Wachowski", job: "Director" },
      { name: "Lilly Wachowski", job: "Director" },
      { name: "Don Davis", job: "Composer" }
    ],
    videos: { results: [{ key: "m8e-FF8MsqU", site: "YouTube", type: "Trailer" }] },
    reviews: {
      results: [
        { author: "RedPill", content: "Absolutely changed the movie industry forever. Bullet time, philosophy, leather jackets - iconic in every way.", rating: 10 }
      ]
    }
  },
  {
    id: 82856,
    name: "The Mandalorian",
    type: "tv",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/9zcbqSxdsRMZWHYtyCd1nXPr2xq.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
    overview: "After the fall of the Galactic Empire, a solitary gunfighter travails the outer reaches of the lawless galaxy, earning his keep as a bounty hunter.",
    vote_average: 8.4,
    first_air_date: "2019-11-12",
    tagline: "This is the Way.",
    original_language: "en",
    genres: ["Action & Adventure", "Sci-Fi & Fantasy"],
    popularity: 124.5,
    adult: false,
    tag: "🌌 Star Wars Epic",
    live: false,
    newRelease: false,
    cast: [
      { name: "Pedro Pascal", character: "The Mandalorian / Din Djarin", profile_path: "/PedroPascal.jpg" },
      { name: "Grogu", character: "The Child", profile_path: "/Grogu.jpg" }
    ],
    crew: [
      { name: "Jon Favreau", job: "Creator" },
      { name: "Ludwig Göransson", job: "Composer" }
    ],
    videos: { results: [{ key: "aOC8E8z_ifw", site: "YouTube", type: "Trailer" }] },
    seasons: [
      {
        season_number: 1,
        name: "Season 1",
        episodes: [
          { episode_number: 1, name: "Chapter 1: The Mandalorian", runtime: 39, overview: "A Mandalorian bounty hunter tracks a target for a well-paying client in the outer rim.", still_path: "/p7zQ5tQ25jNCS05vG6Z7m3eS2X8.jpg" }
        ]
      }
    ],
    reviews: {
      results: [
        { author: "StarWarsFan", content: "Captures the gritty Western feel of the original Star Wars trilogy perfectly. Baby Yoda is adorable, and the score is legendary.", rating: 9 }
      ]
    }
  },
  {
    id: 129,
    title: "Spirited Away",
    type: "movie",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/dyJvKsNs2KP8qQnAXbRwDjblViy.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    overview: "A young girl, Chihiro, becomes trapped in a strange, magical world of spirits. After her parents are turned into pigs, she must work in a bathhouse to find a way to free them and return to the human world.",
    vote_average: 8.5,
    release_date: "2001-07-20",
    runtime: 125,
    tagline: "Nothing that happens is ever forgotten, even if you can't remember it.",
    original_language: "ja", // International
    genres: ["Animation", "Family", "Fantasy"],
    popularity: 91.2,
    adult: false,
    tag: "🌍 International Masterpiece",
    live: false,
    newRelease: false,
    cast: [
      { name: "Rumi Hiiragi", character: "Chihiro (voice)", profile_path: "/RumiH.jpg" },
      { name: "Miyu Irino", character: "Haku (voice)", profile_path: "/MiyuI.jpg" }
    ],
    crew: [
      { name: "Hayao Miyazaki", job: "Director" },
      { name: "Hayao Miyazaki", job: "Writer" },
      { name: "Joe Hisaishi", job: "Composer" }
    ],
    videos: { results: [{ key: "ByXuk9QqQkk", site: "YouTube", type: "Trailer" }] },
    reviews: {
      results: [
        { author: "GhibliLover", content: "An absolute visual feast. Miyazaki's masterpiece is an emotional, fantastical journey into childhood growing pains.", rating: 10 }
      ]
    }
  },
  {
    id: 680,
    title: "Pulp Fiction",
    type: "movie",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg",
    overview: "A burger-loving hitman, his philosophical partner, a drug-addled gangster's moll, and a washed-up boxer converge in this sprawling comedic crime caper.",
    vote_average: 8.5,
    release_date: "1994-09-10",
    runtime: 154,
    tagline: "Just because you are a character doesn't mean that you have character.",
    original_language: "en",
    genres: ["Thriller", "Crime"],
    popularity: 95.8,
    adult: true,
    tag: "⭐ Cult Classic",
    live: false,
    newRelease: false,
    cast: [
      { name: "John Travolta", character: "Vincent Vega", profile_path: "/JohnT.jpg" },
      { name: "Samuel L. Jackson", character: "Jules Winnfield", profile_path: "/SLJ.jpg" },
      { name: "Uma Thurman", character: "Mia Wallace", profile_path: "/UmaT.jpg" },
      { name: "Bruce Willis", character: "Butch Coolidge", profile_path: "/BruceW.jpg" }
    ],
    crew: [
      { name: "Quentin Tarantino", job: "Director" },
      { name: "Quentin Tarantino", job: "Writer" }
    ],
    videos: { results: [{ key: "s7EdQ4FqbhY", site: "YouTube", type: "Trailer" }] },
    reviews: {
      results: [
        { author: "IndieFilmGuy", content: "Tarantino's dialogue is electric, the non-linear structure is genius, and the soundtrack is absolutely timeless.", rating: 10 }
      ]
    }
  },
  {
    id: 244786,
    title: "Whiplash",
    type: "movie",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/wbQa0EnWUyRzQ5d1pHLNRlmsCUP.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
    overview: "Under the direction of a ruthless instructor, a talented young drummer begins his pursuit of perfection at any cost, pushed to his absolute mental and physical limits.",
    vote_average: 8.4,
    release_date: "2014-10-10",
    runtime: 106,
    tagline: "Not quite my tempo.",
    original_language: "en",
    genres: ["Drama", "Music"],
    popularity: 88.4,
    adult: false,
    tag: "🏆 Sundance Winner",
    live: false,
    newRelease: false,
    cast: [
      { name: "Miles Teller", character: "Andrew Neiman", profile_path: "/MilesT.jpg" },
      { name: "J.K. Simmons", character: "Terence Fletcher", profile_path: "/JKSimmons.jpg" }
    ],
    crew: [
      { name: "Damien Chazelle", job: "Director" },
      { name: "Damien Chazelle", job: "Writer" },
      { name: "Justin Hurwitz", job: "Composer" }
    ],
    videos: { results: [{ key: "7d_jQyG8DQ", site: "YouTube", type: "Trailer" }] },
    reviews: {
      results: [
        { author: "JazzJunkie", content: "An incredibly intense, anxiety-inducing film. J.K. Simmons gives an absolutely terrifying, Oscar-winning performance.", rating: 10 }
      ]
    }
  },
  {
    id: 76479,
    name: "The Boys",
    type: "tv",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/bq28ajZaoMyzEIm6REelqyqtEDZ.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/in1R2dDc421JxsoRWaIIAqVI2KE.jpg",
    overview: "A fun and irreverent take on what happens when superheroes—who are as popular as celebrities—abuse their superpowers rather than use them for good.",
    vote_average: 8.5,
    first_air_date: "2019-07-25",
    tagline: "Never meet your heroes.",
    original_language: "en",
    genres: ["Sci-Fi & Fantasy", "Action & Adventure", "Drama"],
    popularity: 185.3,
    adult: true,
    tag: "🔥 Brutally Funny",
    live: true,
    newRelease: false,
    cast: [
      { name: "Karl Urban", character: "Billy Butcher", profile_path: "/KarlUrban.jpg" },
      { name: "Jack Quaid", character: "Hughie Campbell", profile_path: "/JackQuaid.jpg" },
      { name: "Antony Starr", character: "Homelander", profile_path: "/AntonyStarr.jpg" }
    ],
    crew: [
      { name: "Eric Kripke", job: "Creator" },
      { name: "Christopher Lennertz", job: "Composer" }
    ],
    videos: { results: [{ key: "M1bhOaLv4FU", site: "YouTube", type: "Trailer" }] },
    seasons: [
      {
        season_number: 1,
        name: "Season 1",
        episodes: [
          { episode_number: 1, name: "Name of the Game", runtime: 60, overview: "When a speedster superhero kills his girlfriend, Hughie teams up with Billy Butcher to exact revenge on the corrupt Seven.", still_path: "/n67Z5uN6k88FhU27f8V5L6o1P9k.jpg" }
        ]
      }
    ],
    reviews: {
      results: [
        { author: "ComicFan", content: "A genius satire of modern superhero saturation. Antony Starr is absolutely brilliant and chilling as Homelander.", rating: 10 }
      ]
    }
  },
  {
    id: 98,
    title: "Gladiator",
    type: "movie",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/jhk6D8pim3yaByu1801kMoxXFaX.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/wN2xWp1eIwCKOD0BHTcErTBv1Uq.jpg",
    overview: "In the year 180, the death of emperor Marcus Aurelius throws the Roman Empire into chaos. Maximus, one of the empire's most capable generals, is betrayed by the corrupt heir Commodus and forced into slavery as a gladiator.",
    vote_average: 8.2,
    release_date: "2000-05-01",
    runtime: 155,
    tagline: "What we do in life echoes in eternity.",
    original_language: "en",
    genres: ["Action", "Drama", "Adventure"],
    popularity: 110.4,
    adult: false,
    tag: "🏆 Oscar Winner",
    live: false,
    newRelease: false,
    cast: [
      { name: "Russell Crowe", character: "Maximus Decimus Meridius", profile_path: "/RussellCrowe.jpg" },
      { name: "Joaquin Phoenix", character: "Commodus", profile_path: "/JoaquinPhoenix.jpg" }
    ],
    crew: [
      { name: "Ridley Scott", job: "Director" },
      { name: "David Franzoni", job: "Writer" },
      { name: "Hans Zimmer", job: "Composer" }
    ],
    videos: { results: [{ key: "ol67qo3clKE", site: "YouTube", type: "Trailer" }] },
    reviews: {
      results: [
        { author: "RomeFan", content: "A majestic, emotional historical epic with Russell Crowe giving the performance of his career.", rating: 10 }
      ]
    }
  },
  {
    id: 11216,
    name: "Cyberpunk: Edgerunners",
    type: "tv",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/9AT1DitYhtFmXk3xSXFjOyBDZyx.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/3ux8Masy15hwt4wVfKoGp0fUywR.jpg",
    overview: "A street kid trying to survive in a technology and body modification-obsessed city of the future. Having everything to lose, he chooses to stay alive by becoming an edgerunner—a mercenary outlaw also known as a cyberpunk.",
    vote_average: 8.6,
    first_air_date: "2022-09-13",
    tagline: "Get ready to burn.",
    original_language: "ja", // International
    genres: ["Animation", "Sci-Fi & Fantasy", "Action & Adventure"],
    popularity: 142.5,
    adult: true,
    tag: "🌍 Anime Sensation",
    live: false,
    newRelease: false,
    cast: [
      { name: "KENN", character: "David Martinez (voice)", profile_path: "/kenn.jpg" },
      { name: "Aoi Yuki", character: "Lucy (voice)", profile_path: "/aoiyuki.jpg" }
    ],
    crew: [
      { name: "Hiroyuki Imaishi", job: "Director" },
      { name: "Akira Yamaoka", job: "Composer" }
    ],
    videos: { results: [{ key: "JtqIas3bYhg", site: "YouTube", type: "Trailer" }] },
    seasons: [
      {
        season_number: 1,
        name: "Season 1",
        episodes: [
          { episode_number: 1, name: "Let You Down", runtime: 24, overview: "David Martinez learns his mother is working herself to death to pay his school tuition in Night City.", still_path: "/5YVvO1x48Gk5v3hKz37Xf5eD8o0.jpg" }
        ]
      }
    ],
    reviews: {
      results: [
        { author: "Chooh2", content: "A frantic, hyper-violent, emotionally devastating masterpiece from Studio Trigger. The ending will break you.", rating: 10 }
      ]
    }
  },
  {
    id: 507089,
    title: "Parasite",
    type: "movie",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/7NRGAtu8E4343NSKwhkgmVRDINw.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/7BpNtNfxuocYEVREzVMO75hso1l.jpg",
    overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
    vote_average: 8.5,
    release_date: "2019-05-30",
    runtime: 132,
    tagline: "Act like you own the place.",
    original_language: "ko", // International
    genres: ["Comedy", "Thriller", "Drama"],
    popularity: 105.4,
    adult: false,
    tag: "🌍 Historic Oscar Winner",
    live: false,
    newRelease: false,
    cast: [
      { name: "Song Kang-ho", character: "Ki-taek", profile_path: "/SongKangHo.jpg" },
      { name: "Lee Sun-kyun", character: "Mr. Park", profile_path: "/LeeSunKyun.jpg" },
      { name: "Cho Yeo-jeong", character: "Mrs. Park", profile_path: "/ChoYeoJeong.jpg" }
    ],
    crew: [
      { name: "Bong Joon Ho", job: "Director" },
      { name: "Bong Joon Ho", job: "Writer" },
      { name: "Jung Jae-il", job: "Composer" }
    ],
    videos: { results: [{ key: "SEUXfv87Wpk", site: "YouTube", type: "Trailer" }] },
    reviews: {
      results: [
        { author: "CinephileKorea", content: "An incredible blend of dark comedy, social satire, and high-tension thriller. Bong Joon Ho is a genius.", rating: 10 }
      ]
    }
  },
  {
    id: 872906,
    title: "Civil War",
    type: "movie",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/5LtSjMNw6j3LkG29Oa4O0iY5U8.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/jFt1gS4BGHlK8xt76Y81Alp4dbt.jpg",
    overview: "In a near-future America, a team of military-embedded journalists races against time to reach Washington, D.C., before rebel factions descend upon the White House.",
    vote_average: 7.4,
    release_date: "2026-04-10",
    runtime: 109,
    tagline: "Welcome to the frontline.",
    original_language: "en",
    genres: ["Action", "Drama", "War"],
    popularity: 242.4,
    adult: true,
    tag: "🆕 New Release",
    live: true,
    newRelease: true,
    cast: [
      { name: "Kirsten Dunst", character: "Lee", profile_path: "/KirstenD.jpg" },
      { name: "Wagner Moura", character: "Joel", profile_path: "/WagnerM.jpg" },
      { name: "Cailee Spaeny", character: "Jessie", profile_path: "/CaileeS.jpg" }
    ],
    crew: [
      { name: "Alex Garland", job: "Director" },
      { name: "Alex Garland", job: "Writer" },
      { name: "Ben Salisbury", job: "Composer" }
    ],
    videos: { results: [{ key: "aDyQxtg0V2w", site: "YouTube", type: "Trailer" }] },
    reviews: {
      results: [
        { author: "WarZone", content: "A gritty, non-partisan, intense thriller focusing on the trauma and responsibility of photojournalists. Extremely immersive.", rating: 8 }
      ]
    }
  },
  {
    id: 238,
    title: "The Godfather",
    type: "movie",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg",
    poster_path: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone, survives an attempt on his life, his youngest son, Michael, steps in to take care of the killers, launching a campaign of bloody revenge.",
    vote_average: 8.7,
    release_date: "1972-03-14",
    runtime: 175,
    tagline: "An offer you can't refuse.",
    original_language: "en",
    genres: ["Drama", "Crime"],
    popularity: 120.4,
    adult: true,
    tag: "🏆 3x Oscar Winner",
    live: false,
    newRelease: false,
    cast: [
      { name: "Marlon Brando", character: "Vito Corleone", profile_path: "/marlonbrando.jpg" },
      { name: "Al Pacino", character: "Michael Corleone", profile_path: "/alpacino.jpg" },
      { name: "James Caan", character: "Sonny Corleone", profile_path: "/jamescaan.jpg" }
    ],
    crew: [
      { name: "Francis Ford Coppola", job: "Director" },
      { name: "Mario Puzo", job: "Writer" },
      { name: "Nino Rota", job: "Composer" }
    ],
    videos: { results: [{ key: "UaVTIeFdaHk", site: "YouTube", type: "Trailer" }] },
    reviews: {
      results: [
        { author: "CinemaLegend", content: "The absolute pinnacle of cinematic storytelling. Every frame, every performance, every piece of dialogue is legendary.", rating: 10 }
      ]
    }
  }
];

// Helper to format TMDB Image paths
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=500';
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}${size}${path}`;
};

// Unified fetching client supporting local state key & fallback Demo database
export const tmdbService = {
  getApiKey() {
    return localStorage.getItem('nexflix_tmdb_key') || '3fd2be6f0c70a2a598f084ddfb75487c';
  },

  async request(endpoint, params = {}) {
    const key = this.getApiKey();
    if (!key) {
      // Execute local demo fallback resolver
      return this.resolveMock(endpoint, params);
    }

    const queryParams = new URLSearchParams({
      api_key: key,
      language: 'en-US',
      ...params
    });

    const url = `https://api.themoviedb.org/3${endpoint}?${queryParams}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return await response.json();
    } catch (e) {
      console.warn('TMDB API fetch failed. Falling back to Demo Mode data...', e);
      return this.resolveMock(endpoint, params);
    }
  },

  // Mock Database Resolver to replicate actual TMDB REST responses
  resolveMock(endpoint, params) {
    // 1. Trending All Week
    if (endpoint.startsWith('/trending/all/')) {
      return { results: MOCK_ITEMS };
    }

    // 2. Top Rated Movies
    if (endpoint === '/movie/top_rated') {
      const movies = MOCK_ITEMS.filter(item => item.type === 'movie');
      return { results: movies.sort((a, b) => b.vote_average - a.vote_average) };
    }

    // 3. Popular TV Shows
    if (endpoint === '/tv/popular') {
      const tv = MOCK_ITEMS.filter(item => item.type === 'tv');
      return { results: tv.sort((a, b) => b.popularity - a.popularity) };
    }

    // 4. Now Playing (New Releases)
    if (endpoint === '/movie/now_playing') {
      const newItems = MOCK_ITEMS.filter(item => item.newRelease && item.type === 'movie');
      return { results: newItems.length ? newItems : MOCK_ITEMS.filter(item => item.type === 'movie').slice(0, 5) };
    }

    // 5. Genre list
    if (endpoint === '/genre/movie/list') {
      return {
        genres: [
          { id: 28, name: "Action" },
          { id: 18, name: "Drama" },
          { id: 27, name: "Horror" },
          { id: 878, name: "Science Fiction" },
          { id: 35, name: "Comedy" },
          { id: 53, name: "Thriller" },
          { id: 12, name: "Adventure" },
          { id: 16, name: "Animation" }
        ]
      };
    }

    // 6. Search Multi (Movies + TV + People)
    if (endpoint === '/search/multi') {
      const query = (params.query || '').toLowerCase();
      if (!query) return { results: MOCK_ITEMS };
      
      const filtered = MOCK_ITEMS.filter(item => {
        const title = (item.title || item.name || '').toLowerCase();
        const overview = (item.overview || '').toLowerCase();
        return title.includes(query) || overview.includes(query);
      });
      return { results: filtered };
    }

    // 7. Discover Movies with filter params
    if (endpoint === '/discover/movie') {
      let list = MOCK_ITEMS.filter(item => item.type === 'movie');
      
      // Genre filter mock
      if (params.with_genres) {
        const genreId = parseInt(params.with_genres);
        // Map common genre IDs to string filters
        const genreMapping = {
          28: "Action",
          18: "Drama",
          27: "Horror",
          878: "Science Fiction",
          35: "Comedy",
          53: "Thriller",
          12: "Adventure",
          16: "Animation"
        };
        const genreName = genreMapping[genreId];
        if (genreName) {
          list = list.filter(item => item.genres.includes(genreName));
        }
      }
      return { results: list };
    }

    // 8. Individual Movie Details
    if (endpoint.startsWith('/movie/')) {
      const id = parseInt(endpoint.split('/')[2]);
      const movie = MOCK_ITEMS.find(item => item.id === id && item.type === 'movie');
      
      if (!movie) return MOCK_ITEMS[0]; // fallback
      
      if (endpoint.endsWith('/credits')) {
        return { cast: movie.cast || [], crew: movie.crew || [] };
      }
      if (endpoint.endsWith('/similar')) {
        return { results: MOCK_ITEMS.filter(item => item.id !== id && item.type === 'movie').slice(0, 5) };
      }
      if (endpoint.endsWith('/videos')) {
        return movie.videos || { results: [] };
      }
      if (endpoint.endsWith('/reviews')) {
        return movie.reviews || { results: [] };
      }
      return movie;
    }

    // 9. Individual TV Details
    if (endpoint.startsWith('/tv/')) {
      const id = parseInt(endpoint.split('/')[2]);
      const show = MOCK_ITEMS.find(item => item.id === id && item.type === 'tv');
      
      if (!show) return MOCK_ITEMS[2]; // fallback
      
      const parts = endpoint.split('/');
      // tv/{id}/season/{season_number}
      if (parts.length === 5 && parts[3] === 'season') {
        const seasonNum = parseInt(parts[4]);
        const season = (show.seasons || []).find(s => s.season_number === seasonNum);
        return season || { episodes: [] };
      }
      if (endpoint.endsWith('/credits')) {
        return { cast: show.cast || [], crew: show.crew || [] };
      }
      if (endpoint.endsWith('/similar')) {
        return { results: MOCK_ITEMS.filter(item => item.id !== id && item.type === 'tv').slice(0, 5) };
      }
      if (endpoint.endsWith('/videos')) {
        return show.videos || { results: [] };
      }
      if (endpoint.endsWith('/reviews')) {
        return show.reviews || { results: [] };
      }
      return show;
    }

    return { results: MOCK_ITEMS };
  }
};
