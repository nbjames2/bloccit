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
  
  Post.prototype.hasUpvoteFor = function(userId, callback){
    return this.getVotes({
      where: {
        userId: userId,
        postId: this.id
      }
    })
    .then((votes) => {
      if(votes.length !== 1){
        callback(null, false);
      } else {
        if(votes[0].value === 1){
          callback(null, true);
        } else {
          callback(null, false);
        }
      }
    })
    .catch((err) => {
      callback(err);
    })
  }

  Post.prototype.hasDownvoteFor = function(userId, callback){
    return this.getVotes({
      where: {
        userId: userId,
        postId: this.id
      }
    })
    .then((votes) => {
      if(votes.length !== 1){
        callback(null, false);
      } else {
        if(votes[0].value === -1){
          callback(null, true);
        } else {
          callback(null, false);
        }
      }
    })
    .catch((err) => {
      callback(err);
    })
  }

  return Post;
}