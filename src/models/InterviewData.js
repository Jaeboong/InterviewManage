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
      allowNull: true,
      defaultValue: null
    },
    userId: {   
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    question: {
      type: DataTypes.JSON,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.JSON,
      allowNull: true
    },
    response: {
      type: DataTypes.JSON,
      allowNull: true
    },
    selectedQuestions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    },
    rating: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    },
    comments: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    },
    ratingType: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    maxScore: {
      type: DataTypes.INTEGER,
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