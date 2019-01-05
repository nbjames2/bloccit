'use strict';
module.exports = (sequelize, DataTypes) => {
  var Post = sequelize.define('Post', {
    title: {
      type:DataTypes.STRING,
      allowNull: false
    },
    body: {
      type: DataTypes.STRING,
      allowNull: false
    },
    topicId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
  Post.associate = function(models) {
    // associations can be defined here
    Post.belongsTo(models.Topic, {
      foreignKey: "topicId",
      onDelete: "CASCADE"
    });

    Post.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE"
    });

    Post.hasMany(models.Comment, {
      foreignKey: "postId",
      as: "comments"
    });

    Post.hasMany(models.Favourite, {
      foreignKey: "postId",
      as: "favourites"
    });

    Post.afterCreate((post, callback) => {
      return models.Favourite.create({
        userId: post.userId,
        postId: post.id
      });
    });

    Post.hasMany(models.Vote, {
      foreignKey: "postId",
      as: "votes"
    });
  };

  Post.prototype.getPoints = function(){
    if(this.votes.length === 0) return 0;
    return this.votes
      .map((v) => { return v.value })
      .reduce((prev, next) => {return prev + next });
  };

  Post.prototype.getFavouriteFor = function(userId){
    return this.favourites.find((favourite) => { return favourite.userId == userId });
  }

  Post.addScope("lastFiveFor", (userId) => {
    return {
      where: { userId: userId },
      limit: 5,
      order: [["createdAt", "DESC"]]
    }
  });
  
  return Post;
};