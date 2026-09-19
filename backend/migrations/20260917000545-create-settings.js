'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      theme: {
        type: Sequelize.STRING
      },
      accent_color: {
        type: Sequelize.STRING
      },
      language: {
        type: Sequelize.STRING
      },
      sidebar_collapsed: {
        type: Sequelize.BOOLEAN
      },
      store_name: {
        type: Sequelize.STRING
      },
      hotline: {
        type: Sequelize.STRING
      },
      contact_email: {
        type: Sequelize.STRING
      },
      maintenance_mode: {
        type: Sequelize.BOOLEAN
      },
      shipping_fee: {
        type: Sequelize.INTEGER
      },
      free_shipping_threshold: {
        type: Sequelize.INTEGER
      },
      order_sound_enabled: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('settings');
  }
};