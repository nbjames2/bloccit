const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;

describe("Topic", () => {

    beforeEach((done) => {
        this.topic;
        this.post;
        sequelize.sync({force: true}).then((res) => {
            Topic.create({
                title: "This is it!",
                description: "You better believe it!"
            })
            .then((topic) => {
                this.topic = topic;
                Post.create({
                    title: "Is it though?",
                    body: "I'm skeptical",
                    topicId: this.topic.id
                })
                .then((post) => {
                    this.post = post;
                    done();
                });
            })
            .catch((err) => {
                console.log(err);
            });
        });
    });

    describe("#create", () => {
        it("should test whether topic.create creates a topic and stores it in the database", (done) => {
            Topic.create({
                title: "Topic titles are for babies",
                description: "but descriptions, those are for real men"
            })
            .then((topic) => {
                Topic.findById(2)
                .then((topics) => {
                    expect(topics.title).toBe("Topic titles are for babies");
                    expect(topics.description).toBe("but descriptions, those are for real men");
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });

    describe("#getPosts", () => {

        it("should confirm that the associated post is returned", (done) => {
            this.topic.getPosts()
            .then((associatedPosts) => {
                expect(associatedPosts[0].title).toBe("Is it though?");
                expect(associatedPosts[0].body).toBe("I'm skeptical");
                done();
            })
            .catch((err) => {
                console.log(err);
            });
        });
    });
});