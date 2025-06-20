const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 4,  // حداقل طول ۴ کاراکتر مثلا
    unique: true
  },
  born: {
    type: Number
  }
})

module.exports = mongoose.model('Author', authorSchema)
