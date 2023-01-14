const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    key: "userId",
    secret: "this should be a long string",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 25, //1 uur
    },
  })
);

const saltRounds = 10;

const db = mysql.createPool({
  user: "root",
  host: "localhost",
  password: "$*]dkehAkr!)3Pg&",
  database: "logininfo",
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user }); //req.session.user should be object containing email/username/id
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  db.query(
    "SELECT * FROM user_register WHERE username = ? or email = ?",
    [username, email],
    (err, result) => {
      if (result.length > 0) {
        res.send({ message: "De email of gebruikersnaam is in gebruik." });
        console.log("does exist already");
        return null;
      } else {
        bcrypt.hash(password, saltRounds, (err, hash) => {
          db.query(
            "INSERT INTO user_register (username, password, email) VALUES (?,?,?)",
            [username, hash, email],
            (err, result) => {
              if (err) {
                console.log(err.message);
              } else {
                console.log("user in database! ", result);
                res.send({ message: "Je registratie is voltooid!" });
              }
            }
          );
        });
      }
    }
  );
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.query(
    "SELECT * FROM user_register WHERE username = ?",
    username,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }

      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, response) => {
          if (response) {
            req.session.user = {
              username: result[0].username,
              id: result[0].id,
              email: result[0].email,
            };

            res.send(req.session.user);
          } else {
            res.send({ message: "wrong password for this user!" });
          }
        });
      } else {
        res.send({ message: "user doesnt exist" });
      }
    }
  );
});

app.listen(3001, () => {
  console.log("running on port 3001");
});
