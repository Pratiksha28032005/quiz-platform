const express = require('express');
const pool = require('../config/db');
const { authenticate, requireStudent } = require('../middleware/auth');

const router = express.Router();

// Start a quiz attempt
router.post('/quizzes/:quizId/start', authenticate, requireStudent, async (req, res) => {
  const { quizId } = req.params;
  const quizResult = await pool.query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
  if (quizResult.rows.length === 0) return res.status(404).json({ message: 'Quiz not found' });
  const quiz = quizResult.rows[0];
  if (quiz.status !== 'PUBLISHED') return res.status(403).json({ message: 'Quiz is not available' });

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM attempts WHERE quiz_id = $1 AND user_id = $2',
    [quizId, req.user.id]
  );
  if (parseInt(countResult.rows[0].count, 10) >= quiz.max_attempts) {
    return res.status(403).json({ message: 'Maximum attempts reached for this quiz' });
  }

  const attemptResult = await pool.query(
    `INSERT INTO attempts (quiz_id, user_id, status, started_at)
     VALUES ($1,$2,'IN_PROGRESS', NOW()) RETURNING *`,
    [quizId, req.user.id]
  );
  res.status(201).json(attemptResult.rows[0]);
});

// Submit a quiz attempt - ALL scoring happens here on the backend.
router.post('/quizzes/:quizId/submit', authenticate, requireStudent, async (req, res) => {
  const client = await pool.connect();
  try {
    const { quizId } = req.params;
    const { attempt_id, answers } = req.body; // answers: [{question_id, selected_option_id}]
    if (!attempt_id) return res.status(400).json({ message: 'attempt_id is required' });

    const attemptResult = await client.query(
      'SELECT * FROM attempts WHERE id = $1 AND quiz_id = $2 AND user_id = $3',
      [attempt_id, quizId, req.user.id]
    );
    if (attemptResult.rows.length === 0) return res.status(404).json({ message: 'Attempt not found' });
    const attempt = attemptResult.rows[0];
    if (attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ message: 'Attempt already submitted' });
    }

    const quizResult = await client.query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
    const quiz = quizResult.rows[0];

    const questionsResult = await client.query(
      'SELECT id, marks FROM questions WHERE quiz_id = $1',
      [quizId]
    );
    const totalQuestions = questionsResult.rows.length;
    const totalMarks = questionsResult.rows.reduce((sum, q) => sum + q.marks, 0);

    const correctOptionsResult = await client.query(
      `SELECT o.question_id, o.id AS option_id FROM options o
       JOIN questions q ON q.id = o.question_id
       WHERE q.quiz_id = $1 AND o.is_correct = TRUE`,
      [quizId]
    );
    const correctByQuestion = {};
    correctOptionsResult.rows.forEach((r) => { correctByQuestion[r.question_id] = r.option_id; });

    const marksByQuestion = {};
    questionsResult.rows.forEach((q) => { marksByQuestion[q.id] = q.marks; });

    let correctCount = 0;
    let incorrectCount = 0;
    let obtainedMarks = 0;
    const answeredQuestionIds = new Set();

    await client.query('BEGIN');
    for (const ans of (answers || [])) {
      const isCorrect = correctByQuestion[ans.question_id] === ans.selected_option_id;
      if (isCorrect) {
        correctCount += 1;
        obtainedMarks += marksByQuestion[ans.question_id] || 0;
      } else {
        incorrectCount += 1;
      }
      answeredQuestionIds.add(ans.question_id);
      await client.query(
        `INSERT INTO answers (attempt_id, question_id, selected_option_id, is_correct)
         VALUES ($1,$2,$3,$4)`,
        [attempt_id, ans.question_id, ans.selected_option_id, isCorrect]
      );
    }
    const unanswered = totalQuestions - answeredQuestionIds.size;

    const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 10000) / 100 : 0;
    const status = percentage >= quiz.passing_score ? 'PASSED' : 'FAILED';

    // Time taken, capped at the quiz duration so a stalled client can't inflate it.
    const elapsedSeconds = Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000);
    const timeTaken = Math.min(elapsedSeconds, quiz.duration_minutes * 60);

    const updated = await client.query(
      `UPDATE attempts SET
         score = $1, percentage = $2, correct_answers = $3, incorrect_answers = $4,
         unanswered = $5, time_taken_seconds = $6, status = $7, completed_at = NOW()
       WHERE id = $8 RETURNING *`,
      [obtainedMarks, percentage, correctCount, incorrectCount, unanswered, timeTaken, status, attempt_id]
    );

    await client.query('COMMIT');
    res.json(updated.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Failed to submit quiz', error: err.message });
  } finally {
    client.release();
  }
});

// A student's own attempts (history)
router.get('/attempts', authenticate, requireStudent, async (req, res) => {
  const result = await pool.query(
    `SELECT a.*, q.title AS quiz_title FROM attempts a
     JOIN quizzes q ON q.id = a.quiz_id
     WHERE a.user_id = $1 ORDER BY a.started_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
});

// Detailed review of one attempt (owner or admin only)
router.get('/attempts/:id', authenticate, async (req, res) => {
  const attemptResult = await pool.query(
    `SELECT a.*, q.title AS quiz_title, q.passing_score FROM attempts a
     JOIN quizzes q ON q.id = a.quiz_id WHERE a.id = $1`,
    [req.params.id]
  );
  if (attemptResult.rows.length === 0) return res.status(404).json({ message: 'Attempt not found' });
  const attempt = attemptResult.rows[0];
  if (req.user.role !== 'ADMIN' && attempt.user_id !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to view this attempt' });
  }

  const reviewResult = await pool.query(
    `SELECT ans.question_id, q.question_text, q.explanation,
            ans.selected_option_id, ans.is_correct,
            correct_opt.id AS correct_option_id, correct_opt.option_text AS correct_option_text,
            selected_opt.option_text AS selected_option_text
     FROM answers ans
     JOIN questions q ON q.id = ans.question_id
     LEFT JOIN options correct_opt ON correct_opt.question_id = q.id AND correct_opt.is_correct = TRUE
     LEFT JOIN options selected_opt ON selected_opt.id = ans.selected_option_id
     WHERE ans.attempt_id = $1
     ORDER BY q.id ASC`,
    [req.params.id]
  );

  res.json({ ...attempt, review: reviewResult.rows });
});

module.exports = router;
