const favouriteQueries = require("../db/queries.favourites.js");
module.exports = {
    create(req, res, next){
        if(req.user){
            favouriteQueries.createFavourite(req, (err, favourite) => {
                if(err){
                    req.flash("error", err);
                }
            });
        } else {
            req.flash("notice", "You must be signed in to do that.");
        }
        res.redirect(req.headers.referer);
    },

    destroy(req, res, next){
        if(req.user){
            favouriteQueries.deleteFavourite(req, (err, favourite) => {
                if(err){
                    req.flash("error", err);
                }
                res.redirect(req.headers.referer);
            });
        } else {
            req.flash("notice", "You must be signed in to do that.");
            res.redirect(req.headers.referer);
        }
    }
}