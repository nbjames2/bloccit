module.exports = {
    init(app){
        const staticRoutes = require("../routes/static");
        const topicRoutes = require("../routes/topics");
        const postRoutes = require("../routes/posts");
        const userRoutes = require("../routes/users");
        const commentRoutes = require("../routes/comments");
        const voteRoutes = require("../routes/votes");
        const favouriteRoutes = require("../routes/favourites");

        if(process.env.NODE_ENV === "test") {
            const mockAuth = require("../../spec/support/mock-auth.js");
            mockAuth.fakeIt(app);
          }

        app.use(staticRoutes);
        app.use(topicRoutes);
        app.use(postRoutes);
        app.use(userRoutes);
        app.use(commentRoutes);
        app.use(voteRoutes);
        app.use(favouriteRoutes);

    }
}