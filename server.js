const express = require('express'); // Lisame express mooduli, selle abil loome Node.js baasil veebiserveri
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const indexRoutes = require('./controllers/index');
const infoRoutes = require('./controllers/info');

mongoose.connect('mongodb://localhost/prog2');
let db = mongoose.connection;

db.once('open', function() {
    console.log('Connected to database');
});

/**
 * express rakenduse konstant, mille kaudu saame ligi veebiserverile
*/
const app = express();

/**
 * Määrame "view engine -i"
 * Nagu näha package.json failist, siis peame installeerima selleks "EJS" mooduli,
 * kuid serverisse ei pea seda lisama ( require() ), express oskab seda ise automaatselt kasutada
*/
app.set('view engine', 'ejs');

/**
 * Staatiliste failide jagamine.
 * Vaikimisi ei ole Express serveri puhul ühtegi avalikku asukohta.
 * Selleks et jagada staatilist sisu välja poole, peame ära määrama asukohta
 * Antud juhul määrame asukohaks projektis oleva "public" kataloogi.
 * Nüüd kui meil on public kataloogis "css" kataloog, kus on "style.css",
 * siis saame selle kätte localhost:3000/css/style.css
 *
 * Lisainfo: https://expressjs.com/en/starter/static-files.html
*/

app.use(express.static('public'));

app.use(session({
    secret: 'session secret',
    resave: true,
    saveUninitialized: true
}));
/**
 * Port, mida expressi veebiserver kasutab
*/
const PORT = 3000;  

// Passport config
require('./config/passport')(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

app.use('/server-info', infoRoutes);
app.use('/', indexRoutes);

app.listen(PORT, () => {
    /**
     * "Template literals" on ES2015 omadus, mis lubab kasutada "string" -i sees javascripti.
     * NB! - kasutatakse "back-tick" -i (``), mitte tavalisi ühe- ega kahekordseid jutumärke ('', "")
     * Lisainfo: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
    */
    console.log(`Listening on port ${PORT}`);
});