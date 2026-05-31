import express from 'express';
import passport from 'passport';
import passportSteam from 'passport-steam';
const SteamStrategy = passportSteam.Strategy;
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(session({
    secret: 'your_session_secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
    origin: 'http://localhost:3000', // React app URL
    credentials: true
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Configure Steam Strategy
passport.use(new SteamStrategy({
    returnURL: `http://localhost:${PORT}/auth/steam/return`,
    realm: `http://localhost:${PORT}/`,
    apiKey: process.env.STEAM_API_KEY || 'YOUR_STEAM_API_KEY'
}, (identifier, profile, done) => {
    process.nextTick(() => {
        profile.identifier = identifier;
        return done(null, profile);
    });
}));

// Auth Routes
app.get('/auth/steam', passport.authenticate('steam'));

app.get('/auth/steam/return',
    passport.authenticate('steam', { failureRedirect: 'http://localhost:3000/login?error=true' }),
    (req, res) => {
        res.redirect('http://localhost:3000/profile');
    }
);

app.get('/auth/user', (req, res) => {
    res.json(req.user || null);
});

app.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.redirect('http://localhost:3000/');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
