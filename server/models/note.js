"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Note extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Note.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Note.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "User ID is required",
          },
        },
      },
      highlightedText: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          customValidation(value) {
            if (this.noteType === "highlight" && !value) {
              throw new Error(
                "Highlighted text is required for highlight notes"
              );
            }
          },
        },
      },
      explanation: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          customValidation(value) {
            if (this.noteType === "highlight" && !value) {
              throw new Error("Explanation is required for highlight notes");
            }
          },
        },
      },
      originalContext: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          customValidation(value) {
            if (this.noteType === "traditional" && !value) {
              throw new Error("Title is required for traditional notes");
            }
          },
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          customValidation(value) {
            if (this.noteType === "traditional" && !value) {
              throw new Error("Content is required for traditional notes");
            }
          },
        },
      },
      isFavorite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      noteType: {
        type: DataTypes.ENUM("traditional", "highlight"),
        allowNull: false,
        defaultValue: "highlight",
      },
    },
    {
      sequelize,
      modelName: "Note",
    }
  );
  return Note;
};
