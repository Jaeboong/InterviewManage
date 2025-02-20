const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InterviewData = sequelize.define('InterviewData', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    folderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    question: {
      type: DataTypes.JSON,
      allowNull: true
    },
    response: {
      type: DataTypes.JSON,
      allowNull: true
    },
    ratingType: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rating: {
      type: DataTypes.JSON,
      allowNull: true
    }
  });

  InterviewData.associate = (models) => {
    InterviewData.belongsTo(models.Directory, {
      foreignKey: 'folderId',
      as: 'folder'
    });
    InterviewData.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return InterviewData;
};