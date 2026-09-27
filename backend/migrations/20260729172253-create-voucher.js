'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vouchers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      discount_type: {
        type: Sequelize.STRING
      },
      discount_value: {
        type: Sequelize.DECIMAL
      },
      max_discount_amount: {
        type: Sequelize.DECIMAL
      },
      min_order_value: {
        type: Sequelize.DECIMAL
      },
      usage_limit: {
        type: Sequelize.INTEGER
      },
      used_count: {
        type: Sequelize.INTEGER
      },
      limit_per_user: {
        type: Sequelize.INTEGER
      },
      start_date: {
        type: Sequelize.DATE
      },
      end_date: {
        type: Sequelize.DATE
      },
      created_by_type: {
        type: Sequelize.STRING
      },
      creator_id: {
        type: Sequelize.INTEGER
      },
      apply_scope: {
        type: Sequelize.STRING
      },
      is_active: {
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
    await queryInterface.dropTable('Vouchers');
  }
};