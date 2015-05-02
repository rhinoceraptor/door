
/*
 * door model
 * ----------
 *
 * Schema:
 * - id: unique integer ID
 * - state: Boolean, whether the door is open (false), or closed (true)
 * - timestamp: A timestamp when the state was recorded
 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      unique: true
    },
    state: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }
}
