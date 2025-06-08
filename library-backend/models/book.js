const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 2,  // حداقل طول ۲ کاراکتر
  },
  published: {
    type: Number,
    required: true,
  },
  genres: [
    {
      type: String
    }
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true,
  }
})

module.exports = mongoose.model('Book', bookSchema)
