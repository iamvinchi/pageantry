require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const Contestant = require('./models/Contestant')
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');


const adminRoutes = require('./routes/adminRoutes');
const contestantRoutes = require('./routes/contestantRoutes');
const voteRoutes = require('./routes/voteRoutes');

const app = express();

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }));
app.use(flash());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Home route
app.get('/', async (req, res) => {
    try {
        const featuredContestants = await Contestant.find()
            .sort({ voteCount: -1 })
            .limit(4);
            
        res.render('landing/index', {
            title: "Beauty Pageant Voting System",
            description: "Vote for your favorite contestants and support them in the competition!",
            featuredContestants
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});
// Routes
app.use('/admin', adminRoutes);
app.use('/contestants', contestantRoutes);
app.use('/votes', voteRoutes);


// app.get('/', (req, res) => {
//     res.redirect('/contestants');
// });

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});