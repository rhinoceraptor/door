
/*
 * admin model
 * ----------
 *
 * Schema:
 * - id: unique integer ID
 * - username: First Last
 * - pw_salt: The password salt for the admin
 * - pw_hash: The password hash for the admin
 * - reg_date: A timestamp of when the user was registered
 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('admin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      unique: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    pw_salt: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    pw_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    reg_date: {
      DataTypes.DATE,
      allowNull: false,
    },
  }
}
