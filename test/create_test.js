const assert = require("assert");
const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const { loginUser, registerUser } = require("../functions/authentication/user");

const {
   addItem,
   getItems 
  } = require("../functions/shop_files/items");

const CustomMid = require("../functions/middleware/allAuth");
const User = require("../functions/models/userModel");
const app = require("../index");

const userData = {
  username: "test user2",
  email: "testuser@mail.com",
  password: "1234test",
  role: "merchant",
};
const itemData = {
  name: "toy",
  price: 200,
};


const getToken = async () => {
  const { email, password } = userData;
  const user = await User.findByCredentials(email, password);
  const token = await user.generateAuthToken();
  const authHeader = `Bearer ${token}`;
  return authHeader;
};

describe("Creating user", () => {
  it("creates new user", async () => {
  await User.find().deleteOne()
    chai
      .request(app)
      .post("/api/v1/signup", registerUser)
      .send(userData)
      .then((res) => {
        expect(res).to.have.status(200);
        assert(res.body.data && res.body.token);
      })
      .catch((err) => {
        console.error(err);
      });
  });
});

describe("Login in User", () => {
  it("logins in a user", () => {
    const { email, password } = userData;
    const loginCredentials = { email: email, password: password };
    chai
      .request(app)
      .post("/api/v1/login", loginUser)
      .send(loginCredentials)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        assert(res.body.data && res.body.token);
      });
  });
});

describe("Creating item", () => {
  it("creates a new item", async () => {
    try {
      const token = await getToken();
      chai
        .request(app)
        .post(`/api/v1/item/`, CustomMid, addItem)
        .set("authorization", `${token}`)
        .send(itemData)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          assert(res.body.item && res.body.user);
        });
    } catch (error) {
      console.error(error);
    }
  });
});

describe("Getting items", () => {
  it("gets all items", async () => {
    try {
      const token = await getToken();
      chai
        .request(app)
        .get(`/api/v1/item/`, CustomMid, getItems)
        .set("authorization", `${token}`)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
        });
    } catch (error) {
      console.error(error);
    }
  });
});
