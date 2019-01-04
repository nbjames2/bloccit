const Comment = require("./models").Comment;
const Post = require("./models").Post;
const User = require("./models").User;
const Favourite = require("./models").Favourite;
const Authorizer = require("../policies/favourite");

module.exports = {
    createFavourite(req, callback){
        return Favourite.create({
            postId: req.params.postId,
            userId: req.user.id
        })
        .then((favourite) => {
            callback(null, favourite);
        })
        .catch((err) => {
            callback(err);
        });
    },
    deleteFavourite(req, callback){
        const id = req.params.id;
        return Favourite.findById(id)
        .then((favourite) => {
            if(!favourite){
                return callback("Favourite not found");
            }
            const authorized = new Authorizer(req.user, favourite).destroy();
            if(authorized){
                Favourite.destroy({where: { id }})
                .then((deletedRecordsCount) => {
                    callback(null, deletedRecordsCount);
                })
                .catch((err) => {
                    callback(err);
                });
            } else {
                req.flash("notice", "You are not authorized to do that.");
                callback(401);
            }
        })
        .catch((err) => {
            callback(err);
        });
    }
}