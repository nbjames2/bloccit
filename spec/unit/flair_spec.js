const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Flair = require("../../src/db/models").Flair;

describe("flair", () => {

    beforeEach((done) => {
        this.topic;
        this.flair;
        sequelize.sync({force: true}).then((res) => {
            Topic.create({
                title: "Let's call this something silly",
                description: "hmmm, flibbertygibbet?"
            })
            .then((topic) => {
                this.topic = topic;

                Flair.create({
                    name: "Awesome",
                    colour: "yellow",
                    topicId: this.topic.id
                })
                .then((flair) => {
                    this.flair = flair;
                    done();
                });
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });

    describe("#create()", () => {
        it("should create a flair object with a name, colour, and assigned topic", (done) => {
            Flair.create({
                name: "Great",
                colour: "blue",
                topicId: this.topic.id
            })
            .then((flair) => {
                expect(flair.name).toBe("Great");
                expect(flair.colour).toBe("blue");
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });

        it("should not create a flair object with missing name, colour, or assigned topic", (done) => {
            Flair.create({
                name: "Holy Moly"
            })
            .then((flair) => {
                done();
            })
            .catch((err) => {
                expect(err.message).toContain("Flair.colour cannot be null");
                expect(err.message).toContain("Flair.topicId cannot be null");
                done();
            });
        });
    });

    describe("#setTopic()", () => {
        it("should associate a topic and a flair together", (done) => {
            Topic.create({
                title: "This is a different topic",
                description: "I swear!"
            })
            .then((newTopic) => {
                expect(this.flair.topicId).toBe(this.topic.id);
                this.flair.setTopic(newTopic)
                .then((flair) => {
                    expect(flair.topicId).toBe(newTopic.id);
                    done();
                });
            });
        });
    });

    describe("#getTopic()", () => {
        it("should return the associated topic", (done) => {
            this.flair.getTopic()
            .then((associatedTopic) => {
                expect(associatedTopic.title).toBe("Let's call this something silly");
                done();
            });
        });
    });
});