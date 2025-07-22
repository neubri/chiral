"use strict";
const { Model } = require("sequelize");
const { hashPassword } = require("../helpers/bcrypt");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Note, { foreignKey: "userId" });
      User.hasMany(models.Article, { foreignKey: "userId" });
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: DataTypes.STRING,
      googleId: DataTypes.STRING,
      learningInterests: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      profilePicture: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        beforeCreate: (user) => {
          if (user.password) {
            user.password = hashPassword(user.password);
          }
        },
        beforeUpdate: (user) => {
          if (user.changed("password")) {
            user.password = hashPassword(user.password);
          }
        },
      },
    }
  );
  return User;
};
