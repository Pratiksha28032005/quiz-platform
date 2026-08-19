require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const quizRoutes = require('./routes/quizzes');
const questionRoutes = require('./routes/questions');
const attemptRoutes = require('./routes/attempts');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api', questionRoutes);   // /api/quizzes/:quizId/questions, /api/questions/:id
app.use('/api', attemptRoutes);    // /api/quizzes/:quizId/start, /submit, /api/attempts...
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
