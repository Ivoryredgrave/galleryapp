const express = require("express");
const mysql = require("mysql");
const app = express();
const myconn = require("express-myconnection");
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const path = require('path');
const imagenes = require('./routes/imagenes');

app.set("port", process.env.PORT || 9000);
const dbOptions = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "galleryapp"
};

app.use(myconn(mysql, dbOptions, "single"));
app.use(express.json());
app.use(cors({ origin: "*" }));

app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'dbimages')));
app.use("/api/", imagenes);

server.listen(app.get("port"), () => {
  console.log(`listening on *:${app.get("port")}`);
});