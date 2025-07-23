"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Highlight extends Model {
    static associate(models) {
      // Define associations here
      Highlight.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }

  Highlight.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      articleId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Dev.to article ID",
      },
      articleTitle: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Article title for reference",
      },
      articleUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Original article URL",
      },
      highlightedText: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "The text that was highlighted by user",
      },
      explanation: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "AI-generated explanation of the highlighted text",
      },
      context: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Surrounding context of the highlighted text",
      },
      position: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Position metadata: { start, end, paragraph, etc }",
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "User-defined tags for organization",
      },
      isBookmarked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Whether this highlight is bookmarked",
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Highlight",
      tableName: "Highlights",
      indexes: [
        {
          fields: ["userId"],
        },
        {
          fields: ["articleId"],
        },
        {
          fields: ["userId", "articleId"],
        },
        {
          fields: ["isBookmarked"],
        },
      ],
    }
  );

  return Highlight;
};
