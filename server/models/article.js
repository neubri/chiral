'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Article.init({
    userId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    url: DataTypes.STRING,
    content: DataTypes.TEXT,
    author: DataTypes.STRING,
    publishedAt: DataTypes.DATE,
    tags: DataTypes.TEXT,
    devToId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Article',
  });
  return Article;
};