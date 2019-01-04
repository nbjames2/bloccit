'use strict';
module.exports = (sequelize, DataTypes) => {
  var Favourite = sequelize.define('Favourite', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
  Favourite.associate = function(models) {
    // associations can be defined here
    Favourite.belongsTo(models.Post, {
      foreignKey: "postId",
      onDelete: "CASCADE"
    });

    Favourite.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE"
    });
  };
  return Favourite;
};