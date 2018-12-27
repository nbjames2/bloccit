const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;

describe("routes : posts", () => {

    beforeEach((done) => {
        this.topic;
        this.post;
        this.user;
   
        sequelize.sync({force: true}).then(() => {
          Topic.create({
              title: "This title doesn't really matter",
              description: "does it?"
          })
          .then((topic) => {
              this.topic = topic;
              done();
          })
          .catch((err) => {
              console.log(err);
              done();
          })
        });   
      });

    describe("guest user performing CRUD actions for Post", () => {

        beforeEach((done) => {
            User.create({
                email: "todd@example.com",
                password: "123456",
                role: "member"
            })
            .then(() => {
                Post.create({
                    title: "this topic is unimaginative",
                    body: "I want more effort put into my topics",
                    topicId: this.topic.id,
                    userId: 1
                })
                .then((post) => {
                    this.post = post;
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    
        describe("GET /topics/:topicId/posts/new", () => {

            it("should redirect to the sign up form when a guest tries to add a new post", (done) => {
                request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain("HTTP Version Not Supported. Redirecting to /users/sign_up");
                    done();
                });
            });
        });

        describe("POST /topics/:topicId/posts/create", () => {

            it("should not create a new post for guest", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/create`,
                    form: {
                        title: "Watching snow melt",
                        body: "Without a doubt my favourite thing to do besides watching paint dry!"
                    }
                };
                request.post(options, (err, res, body) => {
                    Post.findOne({where: {title: "Watching snow melt"}})
                    .then((post) => {
                        expect(post).toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });

            it("should not create a new post that fails validations", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/create`,
                    form: {
                        title: "a",
                        body: "b"
                    }
                };
                request.post(options, (err, res, body) => {
                    Post.findOne({where: {title: "a"}})
                    .then((post) => {
                        expect(post).toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });

        describe("GET /topics/:topicId/posts/:id", () => {

            it("should render a view with the selected post", (done) => {
                request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("this topic is unimaginative");
                done();
                });
            });

            });

        describe("POST /topics/:topicId/posts/:id/destroy", () => {

            it("should not delete post for guest user", (done) => {
                expect(this.post.id).toBe(1);
                request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
                    Post.findById(1)
                    .then((post) => {
                        expect(err).toBeNull();
                        expect(post.title).toBe("this topic is unimaginative");
                        done();
                    })
                });
            });
        });

        describe("GET /topics/:topicId/posts/:id/edit", () => {

            it("should not allow guest to access view to edit post", (done) => {
                request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain("Not Found. Redirecting to /");
                    done();
                });
            });
        });

        describe("POST /topics/:topicId/posts/:id/update", () => {

            it("should return a status code 404", (done) => {
                request.post({
                    url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
                    form: {
                        title: "Snowman Building Competition",
                        body: "I love watching them melt slowly."
                    }
                }, (err, res, body) => {
                    expect(res.statusCode).toBe(404);
                    done();
                });
            });

            it("should not allow guest to update the post", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
                    form: {
                        title: "Snowman Building Competition",
                        body: "I love watching them melt slowly."
                    }
                };
                request.post(options, (err, res, body) => {
                    expect(err).toBeNull();
                    Post.findOne({
                        where: {id: this.post.id}
                    })
                    .then((post) => {
                        expect(post.title).toBe("this topic is unimaginative");
                        done();
                    });
                });
            });
        });
    });

    describe("admin user performing CRUD operation on post", () => {

        beforeEach((done) => {
            User.create({
              email: "admin@example.com",
              password: "123456",
              role: "admin"
            })
            .then((user) => {
              request.get({    
                url: "http://localhost:3000/auth/fake",
                form: {
                  role: user.role,
                  userId: user.id,
                  email: user.email
                }
              },
                (err, res, body) => {
                    Post.create({
                        title: "this topic is unimaginative",
                        body: "I want more effort put into my topics",
                        topicId: this.topic.id,
                        userId: 1
                    })
                    .then((post) => {
                        this.post = post;
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
          });

        describe("GET /topics/:topicId/posts/new", () => {

            it("should render a new post form", (done) => {
                request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain("New Post");
                    done();
                });
            });
        });
    
        describe("POST /topics/:topicId/posts/create", () => {
    
            it("should create a new post and redirect", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/create`,
                    form: {
                        title: "Watching snow melt",
                        body: "Without a doubt my favourite thing to do besides watching paint dry!"
                    }
                };
                request.post(options, (err, res, body) => {
                    Post.findOne({where: {title: "Watching snow melt"}})
                    .then((post) => {
                        expect(post).not.toBeNull();
                        expect(post.title).toBe("Watching snow melt");
                        expect(post.body).toBe("Without a doubt my favourite thing to do besides watching paint dry!");
                        expect(post.topicId).not.toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
    
            it("should not create a new post that fails validations", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/create`,
                    form: {
                        title: "a",
                        body: "b"
                    }
                };
                request.post(options, (err, res, body) => {
                    Post.findOne({where: {title: "a"}})
                    .then((post) => {
                        expect(post).toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });
    
        describe("GET /topics/:topicId/posts/:id", () => {
    
            it("should render a view with the selected post", (done) => {
              request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("this topic is unimaginative");
                done();
              });
            });
       
          });
    
        describe("POST /topics/:topicId/posts/:id/destroy", () => {
    
            it("should delete the post with the associated ID", (done) => {
                expect(this.post.id).toBe(1);
                request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
                    Post.findById(1)
                    .then((post) => {
                        expect(err).toBeNull();
                        expect(post).toBeNull();
                        done();
                    })
                });
            });
        });
    
        describe("GET /topics/:topicId/posts/:id/edit", () => {
    
            it("should render a view with an edit post form", (done) => {
                request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain("Edit Post");
                    expect(body).toContain("this topic is unimaginative");
                    done();
                });
            });
        });
    
        describe("POST /topics/:topicId/posts/:id/update", () => {
    
            it("should return a status code 302", (done) => {
                request.post({
                    url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
                    form: {
                        title: "Snowman Building Competition",
                        body: "I love watching them melt slowly."
                    }
                }, (err, res, body) => {
                    expect(res.statusCode).toBe(302);
                    done();
                });
            });
    
            it("should update the post with the given values", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
                    form: {
                        title: "Snowman Building Competition",
                        body: "I love watching them melt slowly."
                    }
                };
                request.post(options, (err, res, body) => {
                    expect(err).toBeNull();
                    Post.findOne({
                        where: {id: this.post.id}
                    })
                    .then((post) => {
                        expect(post.title).toBe("Snowman Building Competition");
                        done();
                    });
                });
            });
        });
    });

    describe("member user performing crud operations on Posts", () => {

        beforeEach((done) => {
            User.create({
                email: "member@example.com",
                password: "123456",
                role: "member"
              })
              .then((user) => {
                request.get({
                    url: "http://localhost:3000/auth/fake",
                    form: {
                    role: user.role,
                    email: user.email,
                    userId: user.id
                    }
                },
                    (err, res, body) => {
                        Post.create({
                            title: "this topic is unimaginative",
                            body: "I want more effort put into my topics",
                            topicId: this.topic.id,
                            userId: 1
                        })
                        .then((post) => {
                            this.post = post;
                            done();
                        })
                        .catch((err) => {
                            console.log(err);
                            done();
                        });
                    }
                );
            });
        })

        describe("GET /topics/:topicId/posts/new", () => {

            it("should render a new post form", (done) => {
                request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain("New Post");
                    done();
                });
            });
        });
    
        describe("POST /topics/:topicId/posts/create", () => {
    
            it("should create a new post and redirect", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/create`,
                    form: {
                        title: "Watching snow melt",
                        body: "Without a doubt my favourite thing to do besides watching paint dry!"
                    }
                };
                request.post(options, (err, res, body) => {
                    Post.findOne({where: {title: "Watching snow melt"}})
                    .then((post) => {
                        expect(post).not.toBeNull();
                        expect(post.title).toBe("Watching snow melt");
                        expect(post.body).toBe("Without a doubt my favourite thing to do besides watching paint dry!");
                        expect(post.topicId).not.toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
    
            it("should not create a new post that fails validations", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/create`,
                    form: {
                        title: "a",
                        body: "b"
                    }
                };
                request.post(options, (err, res, body) => {
                    Post.findOne({where: {title: "a"}})
                    .then((post) => {
                        expect(post).toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });
    
        describe("GET /topics/:topicId/posts/:id", () => {
    
            it("should render a view with the selected post", (done) => {
              request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("this topic is unimaginative");
                done();
              });
            });
       
          });
    
        describe("POST /topics/:topicId/posts/:id/destroy", () => {
    
            it("should delete the post with the associated ID", (done) => {
                expect(this.post.id).toBe(1);
                request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
                    Post.findById(1)
                    .then((post) => {
                        expect(err).toBeNull();
                        expect(post).toBeNull();
                        done();
                    })
                });
            });

            it("should not delete a post for someone that is not the owner", (done) => {
                User.create({
                    email: "imposter@example.com",
                    password: "654321",
                    topicId: this.topic.id
                })
                .then((user) => {
                    request.get({
                        url: "http://localhost:3000/auth/fake",
                        form: {
                        role: user.role,
                        email: user.email,
                        userId: user.id
                        }
                    },
                        (err, res, body) => {
                            expect(this.post.id).toBe(1);
                            request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
                                Post.findById(1)
                                .then((post) => {
                                    expect(err).toBeNull();
                                    expect(post.title).toBe("this topic is unimaginative");
                                    done();
                                })
                            });
                        }
                    );
                });    
            })
        });
    
        describe("GET /topics/:topicId/posts/:id/edit", () => {
    
            it("should render a view with an edit post form", (done) => {
                request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain("Edit Post");
                    expect(body).toContain("this topic is unimaginative");
                    done();
                });
            });

            it("should not render the edit view for a member who is not the owner of the post", (done) => {
                User.create({
                    email: "imposter@example.com",
                    password: "654321",
                    topicId: this.topic.id
                })
                .then((user) => {
                    request.get({
                        url: "http://localhost:3000/auth/fake",
                        form: {
                        role: user.role,
                        email: user.email,
                        userId: user.id
                        }
                    },
                        (err, res, body) => {
                            request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
                                expect(err).toBeNull();
                                expect(body).not.toContain("Edit Post");
                                done();
                            });
                        }
                    );
                });    
            })
        });
    
        describe("POST /topics/:topicId/posts/:id/update", () => {
    
            it("should return a status code 302", (done) => {
                request.post({
                    url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
                    form: {
                        title: "Snowman Building Competition",
                        body: "I love watching them melt slowly."
                    }
                }, (err, res, body) => {
                    expect(res.statusCode).toBe(302);
                    done();
                });
            });
    
            it("should update the post with the given values", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
                    form: {
                        title: "Snowman Building Competition",
                        body: "I love watching them melt slowly."
                    }
                };
                request.post(options, (err, res, body) => {
                    expect(err).toBeNull();
                    Post.findOne({
                        where: {id: this.post.id}
                    })
                    .then((post) => {
                        expect(post.title).toBe("Snowman Building Competition");
                        done();
                    });
                });
            });

            it("should not update the post for a user that is not the owner", (done) => {
                User.create({
                    email: "imposter@example.com",
                    password: "654321",
                    topicId: this.topic.id
                })
                .then((user) => {
                    request.get({
                        url: "http://localhost:3000/auth/fake",
                        form: {
                        role: user.role,
                        email: user.email,
                        userId: user.id
                        }
                    },
                        (err, res, body) => {
                            const options = {
                                url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
                                form: {
                                    title: "Snowman Building Competition",
                                    body: "I love watching them melt slowly."
                                }
                            };
                            request.post(options, (err, res, body) => {
                                expect(err).toBeNull();
                                Post.findOne({
                                    where: {id: this.post.id}
                                })
                                .then((post) => {
                                    expect(post.title).toBe("this topic is unimaginative");
                                    done();
                                });
                            });
                        }
                    );
                });
            })
        });

    });
});