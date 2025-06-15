const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const recipeSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
  },

  title: {
    type: String,
    required: true,
  },

  ingredients: {
    type: [String],
    required: true,
  },

  steps: {
    type: String,
    required: true,
  },

  tags: {
    type: [String],
    default: [],
  },

  imageUrl: {
    type: String,
    default: '',
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      text: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    }
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Recipe', recipeSchema);
