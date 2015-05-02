
/*
 * swipe model
 * ----------
 *
 * Schema:
 * - id: unique integer ID
 * - swipe_date: Timestamp of the swipe
 * - card_hash: The presented hash for the card
 * - granted: Boolean, whether the card swipe was granted
 * - user: The ID of the user of the card, if they exist
 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('swipe', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      unique: true
    },
    swipe_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    card_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    granted: {
      DataTypes.BOOLEAN,
      allowNull: false,
    },
    user: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }
}
