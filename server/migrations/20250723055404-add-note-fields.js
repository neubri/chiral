"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Notes", "title", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Notes", "content", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("Notes", "isFavorite", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("Notes", "noteType", {
      type: Sequelize.ENUM("traditional", "highlight"),
      allowNull: false,
      defaultValue: "highlight",
    });

    // Make existing required fields nullable for traditional notes
    await queryInterface.changeColumn("Notes", "highlightedText", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.changeColumn("Notes", "explanation", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Notes", "title");
    await queryInterface.removeColumn("Notes", "content");
    await queryInterface.removeColumn("Notes", "isFavorite");
    await queryInterface.removeColumn("Notes", "noteType");

    // Revert highlightedText and explanation to not null
    await queryInterface.changeColumn("Notes", "highlightedText", {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.changeColumn("Notes", "explanation", {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
