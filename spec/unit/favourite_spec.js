const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const Comment = require("../../src/db/models").Comment;
const User = require("../../src/db/models").User;
const Favourite = require("../../src/db/models").Favourite;

describe("Favourite", () => {

    beforeEach((done) => {
        this.user;
        this.topic;
        this.post;
        this.favourite;

        sequelize.sync({force: true}).then((res) => {
            User.create({
                email: "starman@tesla.com",
                password: "Trekkie4lyfe"
            })
            .then((res) => {
                this.user = res;
                Topic.create({
                    title: "Expeditions to Alpha Centauri",
                    description: "A compilation of reports from recent visits to the star system",
                    posts: [{
                        title: "My first visit to Proxima Centauri b",
                        body: "I saw some rocks.",
                        userId: this.user.id
                    }]
                }, {
                    include: {
                        model: Post,
                        as: "posts"
                    }
                })
                .then((res) => {
                    this.topic = res;
                    this.post = this.topic.posts[0];
                    Comment.create({
                        body: "ay caramba!!!!!",
                        userId: this.user.id,
                        postId: this.post.id
                    })
                    .then((res) => {
                        this.comment = res;
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });

    describe("#create()", () => {

        it("should create a favourite for a post on a user", (done) => {
            Favourite.create({
                postId: this.post.id,
                userId: this.user.id
            })
            .then((favourite) => {
                expect(favourite.postId).toBe(this.post.id);
                expect(favourite.userId).toBe(this.user.id);
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });

        it("should not create a favourite without assigned post or user", (done) => {
            Favourite.create({
                userId: null
            })
            .then((favourite) => {
                done();
            })
            .catch((err) => {
                expect(err.message).toContain("Favourite.userId cannot be null");
                expect(err.message).toContain("Favourite.postId cannot be null");
                done();
            });
        });
    });

    describe("#setUser()", () => {

        it("should associate a favourite and a user together", (done) => {
            Favourite.create({
                postId: this.post.id,
                userId: this.user.id
            })
            .then((favourite) => {
                this.favourite = favourite;
                expect(favourite.userId).toBe(this.user.id);
                User.create({
                    email: "bob@example.com",
                    password: "password"
                })
                .then((newUser) => {
                    this.favourite.setUser(newUser)
                    .then((favourite) => {
                        expect(favourite.userId).toBe(newUser.id);
                        done();
                    });
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            })
        });
    });

    describe("#getUser()", () => {

        it("should return the associated user", (done) => {
            Favourite.create({
                userId: this.user.id,
                postId: this.post.id
            })
            .then((favourite) => {
                favourite.getUser()
                .then((user) => {
                    expect(user.id).toBe(this.user.id);
                    done();
                })
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });

    describe("#setPost()", () => {

        it("should associate a post and a favourite together", (done) => {
            Favourite.create({
                postId: this.post.id,
                userId: this. user.id
            })
            .then((favourite) => {
                this.favourite = favourite;
                Post.create({
                    title: "Dress code on Proxima b",
                    body: "Spacesuit, space helmet, space boots, and space gloves",
                    topicId: this.topic.id,
                    userId: this.user.id
                })
                .then((newPost) => {
                    expect (this.favourite.postId).toBe(this.post.id);
                    this.favourite.setPost(newPost)
                    .then((favourite) => {
                        expect(favourite.postId).toBe(newPost.id);
                        done();
                    });
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });

    describe("getPost()", () => {
        
        it("should return the associated post", (done) => {
            Favourite.create({
                userId: this.user.id,
                postId: this.post.id
            })
            .then((favourite) => {
                this.comment.getPost()
                .then((associatedPost) => {
                    expect(associatedPost.title).toBe("My first visit to Proxima Centauri b");
                    done();
                });
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });

});