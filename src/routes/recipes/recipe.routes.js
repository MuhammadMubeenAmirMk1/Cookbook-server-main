const express = require('express');
const { authToken } = require('../../middlewares');
const { recipeController } = require('../../controllers');

const router = express.Router();

// Public routes
router.get('/', recipeController.getAllRecipes);
router.get('/filter/tags', recipeController.getRecipesByTags);
router.get('/:id', recipeController.getARecipe);

// Protected routes
router.post('/', authToken, recipeController.createRecipe);
router.patch('/:id', authToken, recipeController.updateRecipe);
router.delete('/:id', authToken, recipeController.deleteRecipe);
router.post('/:id/save', authToken, recipeController.saveRecipeToFavorites);
router.post('/:id/comment', authToken, recipeController.commentOnRecipe);

module.exports = router;
