const express = require('express');
const recipeRoutes = require('./recipes/recipe.routes');
const authRoutes = require('./auth/auth.routes');

const router = express.Router();

const routes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/recipes',
    route: recipeRoutes,
  },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
