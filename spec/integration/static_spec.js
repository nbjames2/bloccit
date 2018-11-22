const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/";

describe("routes : static", () => {
    describe("GET /", () => {
        it("should return status code 200", (done) => {
            request.get(base, (err, res, body) => {
                expect(res.statusCode).toBe(200);
                done();
            });
        });
    });

    describe("GET /marco", () => {
        it("should return status code 200 and a response of polo", (done) => {
            request.get("http://localhost:3000/marco", (err, res, body) => {
                expect(res.statusCode).toBe(200);
                expect(body).toBe("polo");
                done();
            });
        });
    });
});