const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Directory = sequelize.define('Directory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'root'
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    }
  });

  Directory.associate = (models) => {
    Directory.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Directory.belongsTo(Directory, {
      foreignKey: 'parentId',
      as: 'parent'
    });
    Directory.hasMany(Directory, {
      foreignKey: 'parentId',
      as: 'children'
    });
    Directory.hasMany(models.InterviewData, {
      foreignKey: 'folderId',
      as: 'interviews'
    });
  };

  return Directory;
};