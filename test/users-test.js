const expect = require('chai').expect;
const Order = require("../models/orders");
const request = require("supertest");
const _ = require("lodash");
const UserTest = require("../controllers/user-control");
const User = require ("../models/users");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
const mongoose = require("mongoose");
let server;
let mongod;
let db, validID, validID2,inValidID;
inValidID = "5db1fd86f7b66c3ac55d7635";

describe("Over Watch User", () =>{

before(async () => {
    try {
        mongod = new MongoMemoryServer({
            instance: {
                port: 27017,
                dbPath: "./test/database",
                dbName: "restaurantManager" // by default generate random dbName
            }
        });
        // Async Trick - this ensures the database is created before
        // we try to connect to it or start the server
        await mongod.getConnectionString();

        mongoose.connect("mongodb://localhost:27017/restaurantManager", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        server = require("../bin/www");
        db = mongoose.connection;
    } catch (error) {
        console.log(error);
    }
});

after(async () => {
    try {
        await db.dropDatabase();
        await mongod.stop()
        await  server.close()
    } catch (error) {
        console.log(error);
    }
});

beforeEach(async () => {
    try {
        const user = new User({
            fName: "kevin",
            lName: "o keeffe",
            email: "kevokeeffe@gmail.com",
            password: "123456",
            permission: "req.body.permission",
            active: true
        });
        await user.save();
        const user2 = new User({
            fName: "req.body",
            lName: "req.body",
            email: "kevinokssffe@gmail.com",
            password: "123456",
            permission: "req.body",
            active: true
        });
        await user2.save();
        const user1 = await User.findOne({ permission: "req.body.permission" });
        validID = user1._id;


    }catch{console.log("error")};
});

describe("ADD /user", () => {
    describe("POST /user", () => {
        it("should return confirmation message and update datastore", () => {
            try {
                const user = {
                    fName: "req.body.fName",
                    lName: "req.body.lName",
                    email: "kevinok2@gmail.com",
                    password: "12345",
                    permission: "req.body.permiss",
                    active: true
                };
                return request(server)
                    .post("/user/add")
                    .send(user)
                    .expect(201)
                    .then(res => {
                        expect(res.body.message).equals("User Created");
                        validID2 = res.body.data._id;

                    });
            }catch{console.log("error")};
        });
        after(() => {
            try{
            return request(server)
                .get(`/user/${validID2}/find`)
                .expect(200)
                .then(res => {
                    expect(res.body[0]).to.have.property("fName", "req.body.fName");
                    expect(res.body[0]).to.have.property("lName", "req.body.lName");
                    expect(res.body[0]).to.have.property("email", "kevinok2@gmail.com");
                    expect(res.body[0]).to.have.property("active", true);
                });
            }catch{console.log("error")};
        });
     });
 });

    describe("GET /user", () => {
        it("should return the matching order", done => {
            try {
                request(server)
                    .get(`/user/${validID}/find`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .then((res) => {
                        expect(res.body[0]).to.have.property("fName", "kevin");
                        expect(res.body[0]).to.have.property("lName", "o keeffe");
                        expect(res.body[0]).to.have.property("email", "kevokeeffe@gmail.com");
                        expect(res.body[0]).to.have.property("active", true);
                        done()
                    });
            }catch{console.log("Get User Fail")}
        });
        after(()=> {
            try {
                return request(server)
                    .get(`/user/${validID}/find`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .then((res) => {
                        expect(res.body[0]).to.have.property("fName", "kevin");
                    });
            }catch{console.log("error")};
        });
        describe("when the id is invalid", () => {
            it("should return the NOT found message", done => {
                try {
                    request(server)
                        .get(`/user/${inValidID}/find`)
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(500)
                        .expect({message: "User NOT Found!"});
                    done();
                }catch{console.log("error")};
            });
        });
    });

describe("DELETE /user", () => {

});

describe("GET_ALL /users", () => {

});

describe("UPDATE /user", () => {

});

});