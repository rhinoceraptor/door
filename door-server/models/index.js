
var sequelize_lib = require('sequelize'),
  path = require('path'),
  config = require('./config');

/* Initialize the SQLite connection */
var sequelize = new sequelize_lib(
  config.db
);


/* Load the models files from the /models directory */
var models = [
  'user',
  'admin',
  'swipe',
  'door'
];

/* Export each model so that others can import just this file for the models */
models.forEach(function(model) {
  module.exports[model] = sequelize.import(path.join(__dirname, model));
});

(function(model) {
  model.swipe.belongsTo(model.user);
})(module.exports);

/* Export the database connection */
module.exports.sequelize = sequelize;

