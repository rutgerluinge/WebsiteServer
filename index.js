const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const db = mysql.createPool({
  user: "root",
  host: "localhost",
  password: "$*]dkehAkr!)3Pg&",
  database: "logininfo",
});

app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  db.query(
    "INSERT INTO logindata (username, password, email) VALUES (?,?,?)",
    [username, password, email],
    (err, result) => {
      console.log(err);
    }
  );
});
db.qu;

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.query(
    "SELECT * FROM logindata WHERE username = ? AND password = ?",
    [username, password],
    (err, result) => {
     
      if (err) {
        res.send({ err: err });
      }
      console.log(result);
      if (result.length > 0) {
        res.send(result);
      } else {
        res.send({ message: "wrong username/password combination" });
      }
    }
  );
});

app.listen(3001, () => {
  console.log("running on port 3001");
});
