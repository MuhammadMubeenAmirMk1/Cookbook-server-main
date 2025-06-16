const Recipe = require('../../models/recipe.model');
const User = require('../../models/user.model');
const mongoose = require('mongoose');

// Get all recipes
const getAllRecipes = async (req, res) => {
  try {
    const allRecipes = await Recipe.find().populate('author', 'name email');

    let favoriteIds = [];

    // Only fetch favorites if the user is logged in
    if (req.userId) {
      const user = await User.findById(req.userId);
      if (user && user.savedRecipes) {
        favoriteIds = user.savedRecipes.map((id) => id.toString());
      }
    }

    const sorted = allRecipes.sort((a, b) => {
      const aFav = favoriteIds.includes(a._id.toString());
      const bFav = favoriteIds.includes(b._id.toString());
      return aFav === bFav ? 0 : aFav ? -1 : 1;
    });

    res.status(200).json({
      status: 'success',
      message: 'Recipes retrieved successfully',
      payload: sorted,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve recipes',
      error: error.message,
    });
  }
};

// Get a single recipe
const getARecipe = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid recipe ID' });
    }

    const recipe = await Recipe.findById(id).populate('author', 'name email');

    if (!recipe) {
      return res.status(404).json({
        status: 'error',
        message: 'Recipe not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Recipe retrieved successfully',
      payload: recipe,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve the recipe',
      error: error.message,
    });
  }
};

// Create a new recipe
const createRecipe = async (req, res) => {
  try {
    const { title, ingredients, steps, tags, imageUrl } = req.body;

    const newRecipe = new Recipe({
      title,
      ingredients,
      steps,
      tags,
      imageUrl,
      author: req.userId,
    });

    const payload = await newRecipe.save();
    res.status(201).json({
      status: 'success',
      message: 'Recipe created successfully',
      payload,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create a new recipe',
      error: error.message,
    });
  }
};

// Update a recipe
const updateRecipe = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid recipe ID' });
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ status: 'error', message: 'Recipe not found' });
    }

    const isOwner = String(recipe.author) === String(req.userId);

    if (req.userRole === 'admin' || isOwner) {
      Object.assign(recipe, req.body);
      await recipe.save();

      return res.status(200).json({
        status: 'success',
        message: 'Recipe updated successfully',
        payload: recipe,
      });
    }

    return res.status(403).json({
      status: 'error',
      message: 'Access denied: You cannot update this recipe',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update the recipe',
      error: error.message,
    });
  }
};

// Delete a recipe
const deleteRecipe = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid recipe ID' });
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ status: 'error', message: 'Recipe not found' });
    }

    const isOwner = String(recipe.author) === String(req.userId);

    if (req.userRole === 'admin' || isOwner) {
      await Recipe.findByIdAndDelete(id);

      return res.status(200).json({
        status: 'success',
        message: 'Recipe deleted successfully',
      });
    }

    return res.status(403).json({
      status: 'error',
      message: 'Access denied: You cannot delete this recipe',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete the recipe',
      error: error.message,
    });
  }
};

const getRecipesByTags = async (req, res) => {
  const { tags } = req.query;

  if (!tags) {
    return res.status(400).json({ status: 'error', message: 'Tags query param is required' });
  }

  const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());

  try {
    const recipes = await Recipe.find({ tags: { $in: tagArray } }).populate('author', 'name email');

    res.status(200).json({
      status: 'success',
      message: 'Filtered recipes retrieved',
      payload: recipes,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to filter recipes',
      error: error.message,
    });
  }
};

const saveRecipeToFavorites = async (req, res) => {
  const { id } = req.params;

  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ status: 'error', message: 'Recipe not found' });
    }

    const user = await User.findById(req.userId);
    const index = user.savedRecipes.indexOf(id);

    if (index > -1) {
      // Unfavorite: remove it
      user.savedRecipes.splice(index, 1);
    } else {
      // Favorite: add it
      user.savedRecipes.push(id);
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      message: index > -1 ? 'Recipe removed from favorites' : 'Recipe saved to favorites',
      payload: user.savedRecipes,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to toggle favorite',
      error: error.message,
    });
  }
};


const commentOnRecipe = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ status: 'error', message: 'Comment text is required' });
  }

  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ status: 'error', message: 'Recipe not found' });
    }

    recipe.comments.push({
      user: req.userId,
      text,
    });

    await recipe.save();

    res.status(201).json({
      status: 'success',
      message: 'Comment added',
      payload: recipe.comments,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to add comment',
      error: error.message,
    });
  }
};


module.exports = {
  getAllRecipes,
  getRecipesByTags,
  saveRecipeToFavorites,
  commentOnRecipe,
  getARecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};
