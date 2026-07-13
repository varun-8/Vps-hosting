const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'John Doe'
  }
});

module.exports = mongoose.model('Profile', profileSchema);
