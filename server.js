// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// ================== CONFIG ==================
const QUESTION_TIME = 20;       // seconds for each question
const LOCK_TIME = 5;            // seconds locked on wrong answer
const TARGET_SCORE = 10;        // first to 10 wins
const POST_GAME_DELAY_MS = 10000;
const PLAYER_DATA_FILE = path.join(__dirname, 'players.json');

// ================== QUESTIONS ==================
const ALL_QUESTIONS = [
    // --- ORIGINAL 10 ---
    { q: "Which planet is closest to the sun?", options: ["Venus", "Mars", "Mercury", "Earth"], answer: 2 },
    { q: "Chemical symbol for Gold?", options: ["Gd", "Go", "Ag", "Au"], answer: 3 },
    { q: "Who wrote 'Hamlet'?", options: ["Hemingway", "Shakespeare", "Orwell", "Austen"], answer: 1 },
    { q: "Largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
    { q: "Bones in human body?", options: ["206", "215", "195", "250"], answer: 0 },
    { q: "Hardest natural substance?", options: ["Gold", "Iron", "Diamond", "Platinum"], answer: 2 },
    { q: "Speed of light (approx)?", options: ["300,000 km/s", "150,000 km/s", "1,000 km/s", "Instant"], answer: 0 },
    { q: "Capital of France?", options: ["Rome", "Madrid", "Berlin", "Paris"], answer: 3 },
    { q: "Smallest prime number?", options: ["0", "1", "2", "3"], answer: 2 },
    { q: "Powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Cytoplasm"], answer: 1 },

    // --- NEW 90 QUESTIONS ---
    { q: "What is the capital of Japan?", options: ["Seoul", "Beijing", "Tokyo", "Bangkok"], answer: 2 },
    { q: "Which element has the chemical symbol 'O'?", options: ["Gold", "Osmium", "Oxygen", "Opium"], answer: 2 },
    { q: "Who painted the Mona Lisa?", options: ["Van Gogh", "Da Vinci", "Picasso", "Monet"], answer: 1 },
    { q: "What is the largest mammal in the world?", options: ["Elephant", "Blue Whale", "Giraffe", "Hippo"], answer: 1 },
    { q: "In what year did WWII end?", options: ["1943", "1944", "1945", "1950"], answer: 2 },
    { q: "What is the square root of 64?", options: ["6", "7", "8", "9"], answer: 2 },
    { q: "Which country is known as the Land of the Rising Sun?", options: ["China", "Australia", "Japan", "Thailand"], answer: 2 },
    { q: "What is the main ingredient in guacamole?", options: ["Tomato", "Avocado", "Onion", "Pepper"], answer: 1 },
    { q: "How many continents are there?", options: ["5", "6", "7", "8"], answer: 2 },
    { q: "What is the boiling point of water?", options: ["100°C", "90°C", "110°C", "120°C"], answer: 0 },
    { q: "Who discovered penicillin?", options: ["Marie Curie", "Alexander Fleming", "Isaac Newton", "Louis Pasteur"], answer: 1 },
    { q: "What is the fastest land animal?", options: ["Lion", "Cheetah", "Horse", "Leopard"], answer: 1 },
    { q: "Which planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Saturn"], answer: 2 },
    { q: "What is the tallest mountain in the world?", options: ["K2", "Kilimanjaro", "Everest", "Fuji"], answer: 2 },
    { q: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], answer: 1 },
    { q: "Who is the author of 'Harry Potter'?", options: ["J.R.R. Tolkien", "George R.R. Martin", "J.K. Rowling", "Suzanne Collins"], answer: 2 },
    { q: "What is the chemical formula for water?", options: ["CO2", "H2O", "O2", "NaCl"], answer: 1 },
    { q: "Which organ pumps blood through the body?", options: ["Liver", "Lungs", "Brain", "Heart"], answer: 3 },
    { q: "What is the currency of the United Kingdom?", options: ["Euro", "Dollar", "Pound", "Yen"], answer: 2 },
    { q: "In which city is the Statue of Liberty located?", options: ["Washington D.C.", "Los Angeles", "New York City", "Boston"], answer: 2 },
    { q: "What is the largest planet in our solar system?", options: ["Earth", "Saturn", "Jupiter", "Neptune"], answer: 2 },
    { q: "Who was the first person to walk on the moon?", options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "Michael Collins"], answer: 2 },
    { q: "What does the 'www' stand for in a website browser?", options: ["World Wide Web", "Wild Wild West", "Web World Wide", "World Web Wide"], answer: 0 },
    { q: "Which color is NOT in a standard rainbow?", options: ["Indigo", "Pink", "Violet", "Orange"], answer: 1 },
    { q: "How many players are on a soccer team on the field?", options: ["9", "10", "11", "12"], answer: 2 },
    { q: "What is the hardest rock?", options: ["Granite", "Marble", "Diamond", "Quartz"], answer: 2 },
    { q: "Which country invented pizza?", options: ["France", "USA", "Italy", "Greece"], answer: 2 },
    { q: "What is the freezing point of water in Celsius?", options: ["0°C", "32°C", "-1°C", "10°C"], answer: 0 },
    { q: "Who was the first President of the USA?", options: ["Lincoln", "Jefferson", "Washington", "Adams"], answer: 2 },
    { q: "What gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"], answer: 2 },
    { q: "How many days are in a leap year?", options: ["364", "365", "366", "367"], answer: 2 },
    { q: "Which instrument has 88 keys?", options: ["Guitar", "Violin", "Piano", "Flute"], answer: 2 },
    { q: "What is the largest organ of the human body?", options: ["Heart", "Liver", "Skin", "Lungs"], answer: 2 },
    { q: "Which is the only mammal that can fly?", options: ["Ostrich", "Bat", "Flying Squirrel", "Penguin"], answer: 1 },
    { q: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], answer: 2 },
    { q: "Who painted 'Starry Night'?", options: ["Picasso", "Monet", "Van Gogh", "Rembrandt"], answer: 2 },
    { q: "What is the main gas found in the air we breathe?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], answer: 2 },
    { q: "How many hearts does an octopus have?", options: ["1", "2", "3", "4"], answer: 2 },
    { q: "In which country would you find the Great Pyramids of Giza?", options: ["Mexico", "Peru", "Egypt", "Sudan"], answer: 2 },
    { q: "What is the chemical symbol for Iron?", options: ["Ir", "In", "Fe", "Au"], answer: 2 },
    { q: "Which Disney princess has a raccoon as a sidekick?", options: ["Ariel", "Pocahontas", "Mulan", "Cinderella"], answer: 1 },
    { q: "What is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], answer: 1 },
    { q: "How many teeth does an adult human normally have?", options: ["28", "30", "32", "34"], answer: 2 },
    { q: "Which planet has the most moons?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], answer: 1 },
    { q: "Who wrote the play 'Romeo and Juliet'?", options: ["Dickens", "Shakespeare", "Hemingway", "Twain"], answer: 1 },
    { q: "What does DNA stand for?", options: ["Deoxyribonucleic Acid", "Deoxyribogenetic Acid", "Dinucleic Acid", "Dual Nitrogen Acid"], answer: 0 },
    { q: "Which country has the largest population?", options: ["India", "USA", "China", "Russia"], answer: 0 },
    { q: "What is the fastest aquatic animal?", options: ["Sailfish", "Shark", "Dolphin", "Tuna"], answer: 0 },
    { q: "How many stars are on the US flag?", options: ["48", "49", "50", "51"], answer: 2 },
    { q: "What is the study of fungi called?", options: ["Biology", "Mycology", "Botany", "Zoology"], answer: 1 },
    { q: "Which element is a diamond made of?", options: ["Carbon", "Sulfur", "Nitrogen", "Oxygen"], answer: 0 },
    { q: "What is the largest bone in the human body?", options: ["Skull", "Spine", "Femur", "Rib"], answer: 2 },
    { q: "Who founded Microsoft?", options: ["Steve Jobs", "Bill Gates", "Elon Musk", "Mark Zuckerberg"], answer: 1 },
    { q: "What is the smallest country in the world?", options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], answer: 1 },
    { q: "Which planet is known as the 'Morning Star'?", options: ["Mars", "Jupiter", "Venus", "Mercury"], answer: 2 },
    { q: "How many liters are in a gallon (approx)?", options: ["2.5", "3.1", "3.8", "4.5"], answer: 2 },
    { q: "What is the hardest substance in the human body?", options: ["Bone", "Nail", "Tooth Enamel", "Hair"], answer: 2 },
    { q: "Which ocean is the Bermuda Triangle located in?", options: ["Pacific", "Indian", "Atlantic", "Arctic"], answer: 2 },
    { q: "What year did the Titanic sink?", options: ["1910", "1912", "1914", "1915"], answer: 1 },
    { q: "What is the national bird of the USA?", options: ["Eagle", "Hawk", "Falcon", "Owl"], answer: 0 },
    { q: "Which blood type is known as the universal donor?", options: ["A", "B", "AB", "O Negative"], answer: 3 },
    { q: "How many rings are in the Olympic logo?", options: ["4", "5", "6", "7"], answer: 1 },
    { q: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Montreal", "Ottawa"], answer: 3 },
    { q: "Who invented the telephone?", options: ["Tesla", "Edison", "Bell", "Marconi"], answer: 2 },
    { q: "What is the largest internal organ?", options: ["Heart", "Lungs", "Liver", "Kidney"], answer: 2 },
    { q: "Which planet rotates on its side?", options: ["Mars", "Uranus", "Jupiter", "Venus"], answer: 1 },
    { q: "How many players are on a basketball team on the court?", options: ["4", "5", "6", "7"], answer: 1 },
    { q: "What does CPU stand for?", options: ["Central Process Unit", "Computer Personal Unit", "Central Processing Unit", "Central Processor Unit"], answer: 2 },
    { q: "Which language has the most native speakers?", options: ["English", "Spanish", "Mandarin", "Hindi"], answer: 2 },
    { q: "What is the currency of Japan?", options: ["Won", "Yuan", "Yen", "Dollar"], answer: 2 },
    { q: "Who painted 'The Last Supper'?", options: ["Michelangelo", "Raphael", "Da Vinci", "Donatello"], answer: 2 },
    { q: "What is the closest star to Earth?", options: ["Proxima Centauri", "Sirius", "The Sun", "Alpha Centauri"], answer: 2 },
    { q: "How many valves does the human heart have?", options: ["2", "3", "4", "5"], answer: 2 },
    { q: "Which country gifted the Statue of Liberty to the USA?", options: ["UK", "France", "Spain", "Italy"], answer: 1 },
    { q: "What is the main ingredient in hummus?", options: ["Lentils", "Chickpeas", "Black Beans", "Peas"], answer: 1 },
    { q: "How many stripes are on the US flag?", options: ["10", "11", "12", "13"], answer: 3 },
    { q: "What is the chemical symbol for Sodium?", options: ["So", "Sa", "Na", "Ni"], answer: 2 },
    { q: "Which animal is known as the 'King of the Jungle'?", options: ["Tiger", "Elephant", "Lion", "Gorilla"], answer: 2 },
    { q: "What is the deepest point in the ocean?", options: ["Mariana Trench", "Puerto Rico Trench", "Java Trench", "Tonga Trench"], answer: 0 },
    { q: "Who wrote 'Pride and Prejudice'?", options: ["Emily Bronte", "Jane Austen", "Charlotte Bronte", "Virginia Woolf"], answer: 1 },
    { q: "How many bones do sharks have?", options: ["0", "206", "150", "500"], answer: 0 },
    { q: "What is the capital of Italy?", options: ["Venice", "Milan", "Florence", "Rome"], answer: 3 },
    { q: "Which planet is furthest from the sun?", options: ["Uranus", "Neptune", "Saturn", "Pluto"], answer: 1 },
    { q: "What is the largest species of shark?", options: ["Great White", "Hammerhead", "Whale Shark", "Tiger Shark"], answer: 2 },
    { q: "Who was the first woman to win a Nobel Prize?", options: ["Rosalind Franklin", "Marie Curie", "Ada Lovelace", "Jane Goodall"], answer: 1 },
    { q: "What is the rarest blood type?", options: ["O Positive", "A Negative", "AB Negative", "B Negative"], answer: 2 },
    { q: "How many strings does a standard violin have?", options: ["4", "5", "6", "3"], answer: 0 },
    { q: "What is the capital of Brazil?", options: ["Rio de Janeiro", "Sao Paulo", "Brasilia", "Buenos Aires"], answer: 2 },
    { q: "Which element has the atomic number 1?", options: ["Helium", "Oxygen", "Hydrogen", "Nitrogen"], answer: 2 },
    { q: "Who is known as the 'Father of Computers'?", options: ["Alan Turing", "Charles Babbage", "Bill Gates", "Steve Jobs"], answer: 1 },
    { q: "What is the largest desert in the world?", options: ["Sahara", "Gobi", "Arabian", "Antarctic"], answer: 3 },
    { q: "Which fruit has its seeds on the outside?", options: ["Banana", "Kiwi", "Strawberry", "Apple"], answer: 2 }
];

// ================== STATE ==================
let lobbyPlayers = {};        // socketId -> { name, ready, crowns }
let playerNames = {};         // socketId -> name (derived from profile)
let socketToGame = {};        // socketId -> gameId
let games = {};               // gameId -> gameState
let nextGameId = 1;
let playerProfiles = {};      // playerId -> profile
let socketToPlayerId = {};    // socketId -> playerId
let nextPlayerNumericId = 1;

loadPlayerProfiles();

function loadPlayerProfiles() {
    try {
        if (fs.existsSync(PLAYER_DATA_FILE)) {
            const raw = fs.readFileSync(PLAYER_DATA_FILE, 'utf-8');
            playerProfiles = JSON.parse(raw);
            const maxId = Object.keys(playerProfiles)
                .map(id => parseInt(id.split('_')[1], 10))
                .filter(Number.isFinite)
                .reduce((max, val) => Math.max(max, val), 0);
            nextPlayerNumericId = maxId + 1;
        }
    } catch (err) {
        console.error('Failed to load player profiles:', err);
        playerProfiles = {};
        nextPlayerNumericId = 1;
    }
}

function savePlayerProfiles() {
    try {
        fs.writeFileSync(PLAYER_DATA_FILE, JSON.stringify(playerProfiles, null, 2));
    } catch (err) {
        console.error('Failed to save player profiles:', err);
    }
}

function getLeaderboard(limit = 20) {
    return Object.values(playerProfiles)
        .sort((a, b) => {
            if (b.crowns !== a.crowns) return b.crowns - a.crowns;
            if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
            return a.name.localeCompare(b.name);
        })
        .slice(0, limit);
}

function getLeaderboardPayload(limit = 20) {
    return {
        list: getLeaderboard(limit),
        totalPlayers: Object.keys(playerProfiles).length
    };
}

function getProfileBySocket(socketId) {
    const pid = socketToPlayerId[socketId];
    if (!pid) return null;
    return playerProfiles[pid] || null;
}

function recordCorrectAnswer(socketId) {
    const profile = getProfileBySocket(socketId);
    if (!profile) return;
    profile.correctAnswers = (profile.correctAnswers || 0) + 1;
    savePlayerProfiles();
    io.emit('leaderboard_update', getLeaderboardPayload());
}

function awardCrown(socketId) {
    const profile = getProfileBySocket(socketId);
    if (!profile) return;
    profile.crowns = (profile.crowns || 0) + 1;
    savePlayerProfiles();
    Object.entries(socketToPlayerId).forEach(([sid, pid]) => {
        if (pid === profile.id && lobbyPlayers[sid]) {
            lobbyPlayers[sid].crowns = profile.crowns;
        }
    });
    io.emit('lobby_state', lobbyPlayers);
    io.emit('leaderboard_update', getLeaderboardPayload());
}

function sanitizeName(name) {
    return (name || 'Player').toString().trim().replace(/\s+/g, ' ').slice(0, 18) || 'Player';
}

function getCrownsForSocket(socketId) {
    const profile = getProfileBySocket(socketId);
    return profile ? profile.crowns || 0 : 0;
}

function loadQuestionFile(relativePath, label = 'extra questions') {
    const filePath = path.join(__dirname, relativePath);
    if (!fs.existsSync(filePath)) return [];

    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const lines = raw.split(/\r?\n/);
        const optionRegex = /^([A-D])(?:[\.\)\:\-])?\s+(.*)$/i;
        const questions = [];
        let current = null;

        const finalize = () => {
            if (!current || !current.question || !current.options.length) {
                current = null;
                return;
            }
            let answerIndex = -1;
            if (current.correct) {
                const target = current.correct.trim().toLowerCase();
                answerIndex = current.options.findIndex(opt => opt.trim().toLowerCase() === target);
            }
            if (answerIndex === -1) answerIndex = 0;
            questions.push({
                q: current.question.trim(),
                options: current.options.map(opt => opt.trim()),
                answer: answerIndex
            });
            current = null;
        };

        lines.forEach(lineRaw => {
            const trimmed = lineRaw.trim();
            if (!trimmed) return;

            if (trimmed.startsWith('#Q')) {
                finalize();
                const questionText = trimmed.replace(/^#Q\s*/i, '').trim();
                current = { question: questionText, options: [], correct: null };
            } else if (trimmed.startsWith('^')) {
                if (current) current.correct = trimmed.slice(1).trim();
            } else {
                if (!current) return;

                const optMatch = optionRegex.exec(lineRaw);
                if (optMatch && (current.correct !== null || current.options.length)) {
                    current.options.push(optMatch[2].trim());
                    return;
                }

                current.question = current.question
                    ? `${current.question} ${trimmed}`
                    : trimmed;
            }
        });

        finalize();
        if (questions.length) {
            console.log(`Loaded ${questions.length} ${label}.`);
        }
        return questions;
    } catch (err) {
        console.error(`Failed to load ${label}:`, err);
        return [];
    }
}

['brain-teasers', 'films', 'general', 'geography', 'history', 'world'].forEach((fileName) => {
    const bundle = loadQuestionFile(fileName, fileName);
    if (bundle.length) {
        ALL_QUESTIONS.push(...bundle);
    }
});

// ================== HELPERS ==================
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function getName(id) {
    const profile = getProfileBySocket(id);
    if (profile) return profile.name;
    return playerNames[id] || 'Player';
}

function attemptMatchmaking() {
    const ready = Object.entries(lobbyPlayers)
        .filter(([, p]) => p.ready)
        .map(([id]) => id);

    while (ready.length >= 2) {
        const p1 = ready.shift();
        const p2 = ready.shift();
        if (!lobbyPlayers[p1] || !lobbyPlayers[p2]) continue;

        lobbyPlayers[p1].ready = false;
        lobbyPlayers[p2].ready = false;

        createGame(p1, p2);
    }

    io.emit('lobby_state', lobbyPlayers);
}

function createGame(p1Id, p2Id) {
    const gameId = `game_${nextGameId++}`;
    const questions = shuffle(ALL_QUESTIONS.slice()); // fresh random order

    const game = {
        id: gameId,
        players: [p1Id, p2Id],
        scores: { [p1Id]: 0, [p2Id]: 0 },
        questions,
        questionIndex: 0,
        questionActive: false,
        masterTimer: null,
        masterTimeLeft: QUESTION_TIME,
        lockTimeouts: {},       // playerId -> timeout
        countdownTimer: null,
        countdownLeft: 3,
        finished: false
    };

    games[gameId] = game;

    // Move players from lobby to this game room
    [p1Id, p2Id].forEach(id => {
        delete lobbyPlayers[id];
        socketToGame[id] = gameId;

        const s = io.sockets.sockets.get(id);
        if (s) s.join(gameId);
    });

    io.emit('lobby_state', lobbyPlayers);

    io.to(gameId).emit('match_found', {
        gameId,
        targetScore: TARGET_SCORE,
        players: game.players.map(id => ({
            id,
            name: getName(id)
        }))
    });

    startPreGameCountdown(gameId);
}

function startPreGameCountdown(gameId) {
    const game = games[gameId];
    if (!game || game.finished) return;

    game.countdownLeft = 3;
    io.to(gameId).emit('pregame_countdown', { value: game.countdownLeft });

    game.countdownTimer = setInterval(() => {
        const g = games[gameId];
        if (!g || g.finished) {
            clearInterval(game.countdownTimer);
            return;
        }

        g.countdownLeft -= 1;

        if (g.countdownLeft > 0) {
            io.to(gameId).emit('pregame_countdown', { value: g.countdownLeft });
        } else {
            clearInterval(g.countdownTimer);
            g.countdownTimer = null;
            io.to(gameId).emit('pregame_countdown', { value: 0 });
            startNextQuestion(gameId);
        }
    }, 1000);
}

function startNextQuestion(gameId) {
    const game = games[gameId];
    if (!game || game.finished) return;

    // Check for winner just in case
    const winnerId = Object.keys(game.scores).find(
        id => game.scores[id] >= TARGET_SCORE
    );
    if (winnerId) {
        finishGame(gameId, winnerId);
        return;
    }

    if (game.questionIndex >= game.questions.length) {
        // Out of questions: highest score wins (or tie = no winner)
        const [a, b] = game.players;
        const sa = game.scores[a] || 0;
        const sb = game.scores[b] || 0;
        let w = null;
        if (sa > sb) w = a;
        else if (sb > sa) w = b;
        finishGame(gameId, w);
        return;
    }

    game.questionActive = true;
    game.masterTimeLeft = QUESTION_TIME;

    // Clear any old locks
    Object.values(game.lockTimeouts).forEach(clearTimeout);
    game.lockTimeouts = {};

    const q = game.questions[game.questionIndex];

    io.to(gameId).emit('new_question', {
        q: q.q,
        options: q.options,
        round: game.questionIndex + 1,
        targetScore: TARGET_SCORE
    });

    if (game.masterTimer) clearInterval(game.masterTimer);
    game.masterTimer = setInterval(() => {
        const g = games[gameId];
        if (!g || g.finished || !g.questionActive) {
            clearInterval(game.masterTimer);
            return;
        }

        g.masterTimeLeft -= 1;

        io.to(gameId).emit('timer_sync', {
            type: 'master',
            timeLeft: g.masterTimeLeft,
            total: QUESTION_TIME
        });

        if (g.masterTimeLeft <= 0) {
            clearInterval(g.masterTimer);
            g.masterTimer = null;
            handleTimeUp(gameId);
        }
    }, 1000);
}

function handleTimeUp(gameId) {
    const game = games[gameId];
    if (!game || game.finished || !game.questionActive) return;

    game.questionActive = false;

    io.to(gameId).emit('time_up');

    Object.values(game.lockTimeouts).forEach(clearTimeout);
    game.lockTimeouts = {};

    game.questionIndex++;
    setTimeout(() => startNextQuestion(gameId), 1500);
}

function handleAnswer(gameId, playerId, answerIndex) {
    const game = games[gameId];
    if (!game || game.finished || !game.questionActive) return;

    // Ignore if player currently locked
    if (game.lockTimeouts[playerId]) return;

    const q = game.questions[game.questionIndex];
    const correct = q.answer;

    if (answerIndex === correct) {
        // Correct
        game.scores[playerId] = (game.scores[playerId] || 0) + 1;
        recordCorrectAnswer(playerId);

        io.to(gameId).emit('round_winner', {
            winnerId: playerId,
            correctIndex: correct,
            scores: game.scores
        });

        // Check victory condition
        if (game.scores[playerId] >= TARGET_SCORE) {
            finishGame(gameId, playerId);
            return;
        }

        game.questionActive = false;

        if (game.masterTimer) {
            clearInterval(game.masterTimer);
            game.masterTimer = null;
        }
        Object.values(game.lockTimeouts).forEach(clearTimeout);
        game.lockTimeouts = {};

        game.questionIndex++;
        setTimeout(() => startNextQuestion(gameId), 1500);
    } else {
        // Incorrect -> lock this player only
        io.to(gameId).emit('missed_answer', {
            missedId: playerId,
            duration: LOCK_TIME
        });

        if (game.lockTimeouts[playerId]) {
            clearTimeout(game.lockTimeouts[playerId]);
        }

        game.lockTimeouts[playerId] = setTimeout(() => {
            const g = games[gameId];
            if (!g || g.finished) return;
            delete g.lockTimeouts[playerId];
            io.to(gameId).emit('lock_released', { id: playerId });
        }, LOCK_TIME * 1000);
    }
}

function finishGame(gameId, winnerId) {
    const game = games[gameId];
    if (!game || game.finished) return;

    game.finished = true;
    game.questionActive = false;

    if (game.masterTimer) clearInterval(game.masterTimer);
    if (game.countdownTimer) clearInterval(game.countdownTimer);
    Object.values(game.lockTimeouts).forEach(clearTimeout);

    if (winnerId) {
        awardCrown(winnerId);
    }

    io.to(gameId).emit('game_over', {
        winnerId,
        scores: game.scores,
        targetScore: TARGET_SCORE
    });

    // After a short delay, return players to lobby
    setTimeout(() => {
        const g = games[gameId];
        if (!g) return;

        g.players.forEach(pid => {
            const s = io.sockets.sockets.get(pid);
            delete socketToGame[pid];

            if (s) {
                s.leave(gameId);
                // put them back to lobby (unready)
                lobbyPlayers[pid] = {
                    name: getName(pid),
                    ready: false,
                    crowns: getCrownsForSocket(pid)
                };
                s.emit('return_to_lobby', { profile: getProfileBySocket(pid) });
            }
        });

        delete games[gameId];
        io.emit('lobby_state', lobbyPlayers);
    }, POST_GAME_DELAY_MS);
}

function handleDisconnectInGame(gameId, playerId) {
    const game = games[gameId];
    delete socketToGame[playerId];

    if (!game || game.finished) {
        delete playerNames[playerId];
        return;
    }

    const opponentId = game.players.find(id => id !== playerId);

    if (opponentId && io.sockets.sockets.get(opponentId)) {
        io.to(gameId).emit('opponent_disconnected');
        finishGame(gameId, opponentId);
    } else {
        // both gone or no opponent; clean up
        if (game.masterTimer) clearInterval(game.masterTimer);
        if (game.countdownTimer) clearInterval(game.countdownTimer);
        Object.values(game.lockTimeouts).forEach(clearTimeout);
        delete games[gameId];
    }

    delete playerNames[playerId];
    delete socketToPlayerId[playerId];
}

// ================== SOCKET.IO ==================
io.on('connection', (socket) => {
    socket.emit('lobby_init', {
        id: socket.id,
        players: lobbyPlayers,
        leaderboard: getLeaderboardPayload(),
        howToPlay: [
            "First to answer gets a point.",
            "Answer incorrectly and you're locked for 5 seconds.",
            `First to ${TARGET_SCORE} points wins!`,
            "Good Luck!"
        ]
    });

    socket.on('register_profile', ({ playerId, name }) => {
        let profile = null;
        if (playerId && playerProfiles[playerId]) {
            profile = playerProfiles[playerId];
            if (name && name.trim()) {
                profile.name = sanitizeName(name);
            }
        } else {
            if (!name || !name.trim()) {
                socket.emit('registration_error', { message: "Please enter a name to jump in." });
                return;
            }
            const newId = `player_${nextPlayerNumericId++}`;
            profile = {
                id: newId,
                name: sanitizeName(name),
                crowns: 0,
                correctAnswers: 0,
                createdAt: Date.now()
            };
            playerProfiles[newId] = profile;
        }

        profile.crowns = profile.crowns || 0;
        profile.correctAnswers = profile.correctAnswers || 0;
        savePlayerProfiles();

        socketToPlayerId[socket.id] = profile.id;
        playerNames[socket.id] = profile.name;
        lobbyPlayers[socket.id] = { name: profile.name, ready: false, crowns: profile.crowns };

        socket.emit('profile_registered', {
            profile,
            leaderboard: getLeaderboardPayload()
        });

        io.emit('lobby_state', lobbyPlayers);
        io.emit('leaderboard_update', getLeaderboardPayload());
    });

    socket.on('ready_up', () => {
        if (socketToGame[socket.id]) return;         // already in a game
        if (!lobbyPlayers[socket.id]) return;

        lobbyPlayers[socket.id].ready = true;
        io.emit('lobby_state', lobbyPlayers);
        attemptMatchmaking();
    });

    socket.on('submit_answer', (answerIndex) => {
        const gameId = socketToGame[socket.id];
        if (!gameId) return;
        handleAnswer(gameId, socket.id, answerIndex);
    });

    socket.on('disconnect', () => {
        const gameId = socketToGame[socket.id];

        if (gameId) {
            handleDisconnectInGame(gameId, socket.id);
        } else {
            // In lobby only
            delete lobbyPlayers[socket.id];
            io.emit('lobby_state', lobbyPlayers);
        }

        delete playerNames[socket.id];
        delete socketToPlayerId[socket.id];
    });
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
