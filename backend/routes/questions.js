const express = require('express');
const pool = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Get all questions for a quiz.
// IMPORTANT: students never receive is_correct here - only admins do.
// (Students get options to select from when attempting; correct answers are
// revealed only after submission via the results endpoint.)
router.get('/quizzes/:quizId/questions', authenticate, async (req, res) => {
  const { quizId } = req.params;
  const questionsResult = await pool.query(
    'SELECT * FROM questions WHERE quiz_id = $1 ORDER BY id ASC',
    [quizId]
  );
  const questions = questionsResult.rows;

  const optionsResult = await pool.query(
    `SELECT o.* FROM options o
     JOIN questions q ON q.id = o.question_id
     WHERE q.quiz_id = $1 ORDER BY o.id ASC`,
    [quizId]
  );

  const isAdmin = req.user.role === 'ADMIN';
  const grouped = questions.map((q) => ({
    ...q,
    options: optionsResult.rows
      .filter((o) => o.question_id === q.id)
      .map((o) => (isAdmin ? o : { id: o.id, option_text: o.option_text })),
  }));

  res.json(grouped);
});

router.post('/quizzes/:quizId/questions', authenticate, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { quizId } = req.params;
    const { question_text, marks, explanation, difficulty, options } = req.body;
    if (!question_text || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'question_text and at least 2 options are required' });
    }
    if (!options.some((o) => o.is_correct)) {
      return res.status(400).json({ message: 'At least one option must be marked correct' });
    }

    await client.query('BEGIN');
    const qResult = await client.query(
      `INSERT INTO questions (quiz_id, question_text, marks, explanation, difficulty)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [quizId, question_text, marks || 1, explanation || null, difficulty || 'BEGINNER']
    );
    const question = qResult.rows[0];

    const insertedOptions = [];
    for (const opt of options) {
      const oResult = await client.query(
        'INSERT INTO options (question_id, option_text, is_correct) VALUES ($1,$2,$3) RETURNING *',
        [question.id, opt.option_text, !!opt.is_correct]
      );
      insertedOptions.push(oResult.rows[0]);
    }
    await client.query('COMMIT');
    res.status(201).json({ ...question, options: insertedOptions });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Failed to create question', error: err.message });
  } finally {
    client.release();
  }
});

router.put('/questions/:id', authenticate, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { question_text, marks, explanation, difficulty, options } = req.body;

    await client.query('BEGIN');
    const qResult = await client.query(
      `UPDATE questions SET
         question_text = COALESCE($1, question_text),
         marks = COALESCE($2, marks),
         explanation = COALESCE($3, explanation),
         difficulty = COALESCE($4, difficulty)
       WHERE id = $5 RETURNING *`,
      [question_text, marks, explanation, difficulty, id]
    );
    if (qResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Question not found' });
    }

    if (Array.isArray(options)) {
      await client.query('DELETE FROM options WHERE question_id = $1', [id]);
      for (const opt of options) {
        await client.query(
          'INSERT INTO options (question_id, option_text, is_correct) VALUES ($1,$2,$3)',
          [id, opt.option_text, !!opt.is_correct]
        );
      }
    }
    await client.query('COMMIT');
    res.json({ message: 'Question updated' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Failed to update question', error: err.message });
  } finally {
    client.release();
  }
});

router.delete('/questions/:id', authenticate, requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM questions WHERE id = $1', [req.params.id]);
  res.json({ message: 'Question deleted' });
});

module.exports = router;
