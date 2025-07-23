"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Highlights", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      articleId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      articleTitle: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      articleUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      highlightedText: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      explanation: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      context: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      position: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      isBookmarked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex("Highlights", ["userId"]);
    await queryInterface.addIndex("Highlights", ["articleId"]);
    await queryInterface.addIndex("Highlights", ["userId", "articleId"]);
    await queryInterface.addIndex("Highlights", ["isBookmarked"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Highlights");
  },
};
