const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/ads/";
const sequelize = require("../../src/db/models/index").sequelize;
const Advertisement = require("../../src/db/models").Advertisement;

describe("routes : advertisements", () => {

    beforeEach((done) => {
        this.advertisement;
        sequelize.sync({force:true}).then((res) => {
            Advertisement.create({
                title: "Buy This Now",
                description: "It doesn't matter, just buy it"
            })
            .then((advertisement) => {
                this.advertisement = advertisement;
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });
    
    describe("GET /ads", () => {

        it("should return a status code 200 and all advertisements", (done) => {
            request.get(base, (err, res, body) => {
                expect(res.statusCode).toBe(200);
                expect(err).toBeNull();
                expect(body).toContain("Advertisements");
                expect(body).toContain("Buy This Now");
                done();
            });
        });
    });

    describe("GET /ads/new", () =>{

        it("should render a new advertisement form", (done) => {
            request.get(`${base}new`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("New Advertisement");
                done();
            });
        });
    
    });

    describe("POST /ads/create", () => {
        const options = {
            url: `${base}create`,
            form: {
                title: "Why not?",
                description: "Only you lose if you don't buy it"
            }
        };

        it("should create a new topic and redirect", (done) => {
            request.post(options, (err, res, body) => {
                Advertisement.findOne({where: {title: "Why not?"}})
                .then((advertisement) => {
                    expect(res.statusCode).toBe(303);
                    expect(advertisement.title).toBe("Why not?");
                    expect(advertisement.description).toBe("Only you lose if you don't buy it");
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });

    describe("GET /ads/:id", () => {

        it("shoulid render a view with the selected topic", (done) => {
            request.get(`${base}${this.advertisement.id}`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("Buy This Now");
                done();
            });
        });
    });

    describe("POST /ads/:id/destroy", () => {

        it("should delete the advertisement with the associated ID", (done) => {
            Advertisement.all()
            .then((advertisements) => {
                const adCountBeforeDelete = advertisements.length;
                expect(adCountBeforeDelete).toBe(1);
                request.post(`${base}${this.advertisement.id}/destroy`, (err, res, body) => {
                    Advertisement.all()
                    .then((advertisements) => {
                        expect(err).toBeNull();
                        expect(advertisements.length).toBe(adCountBeforeDelete - 1);
                        done();
                    })
                });
            });
        });
    });

    describe("GET /ads/:id/edit", () => {

        it("should render a view with an edit topic form", (done) => {
            request.get(`${base}${this.advertisement.id}/edit`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("Edit Advertisement");
                expect(body).toContain("Buy This Now");
                done();
            });
        });
    });

    describe("POST /ads/:id/update", () => {
        
        it("should update the advertisement with the given values", (done) => {
            const options = {
                url: `${base}${this.advertisement.id}/update`,
                form: {
                    title: "Why would you want to change this?",
                    description:"Because I said so, fool!"
                }
            };
            request.post(options, (err, res, body) => {
                expect(err).toBeNull();
                Advertisement.findOne({
                    where: { id: this.advertisement.id }
                })
                .then((advertisement) => {
                    expect(advertisement.title).toBe("Why would you want to change this?");
                    done();
                });
            });
        });
    });
});