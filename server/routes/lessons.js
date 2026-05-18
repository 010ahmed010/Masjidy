const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const { authMiddleware, teacherOnly } = require('../middleware/auth');

router.get('/public', async (req, res) => {
  try {
    const { weekStart } = req.query;
    const filter = {};
    if (weekStart) {
      filter.weekStart = new Date(weekStart);
    } else {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      filter.weekStart = { $gte: new Date(monday.getTime() - 7 * 24 * 60 * 60 * 1000), $lte: sunday };
    }
    const lessons = await Lesson.find(filter)
      .populate('class', 'name')
      .populate('teacher', 'name')
      .sort({ weekStart: -1 });
    res.json(lessons);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { classId, weekStart } = req.query;
    const filter = {};
    if (classId) filter.class = classId;
    if (weekStart) filter.weekStart = new Date(weekStart);
    if (req.user.role === 'teacher') filter.teacher = req.user.id;
    const lessons = await Lesson.find(filter).populate('class', 'name').populate('teacher', 'name').sort({ weekStart: -1 });
    res.json(lessons);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { classId, weekStart, days } = req.body;
    let lesson = await Lesson.findOne({ class: classId, weekStart: new Date(weekStart), teacher: req.user.id });
    if (lesson) {
      lesson.days = days;
      await lesson.save();
    } else {
      lesson = new Lesson({ class: classId, teacher: req.user.id, weekStart: new Date(weekStart), days });
      await lesson.save();
    }
    res.json(lesson);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
