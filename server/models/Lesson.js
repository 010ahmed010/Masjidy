const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  days: [{
    day: String,
    time: String,
    topic: String,
    description: String,
    course: String
  }]
}, { timestamps: true });

lessonSchema.index({ class: 1, teacher: 1 }, { unique: true });

module.exports = mongoose.model('Lesson', lessonSchema);
