
/*
 * user model
 * ----------
 *
 * Schema:
 * - id: unique integer ID
 * - name: First Last
 * - card_hash: The hash of the data contained on the user's card
 * - card_desc: A short description of the card
 * - reg_date: A timestamp of when the user was registered
 * - registar: Which administrator registered the user
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
    name: DataTypes.STRING,
    card_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    card_desc: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reg_date: {
      DataTypes.DATE,
      allowNull: false,
    },
    registrar: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }
}
