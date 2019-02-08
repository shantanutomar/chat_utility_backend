// requires
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var http = require("http");
var socketIO = require("socket.io");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var helperFunction = require("./helpers/helperFunctions");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// routes
app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

var port = helperFunction.normalizePort("4001");
app.set("port", port);

var server = http.createServer(app);
const io = socketIO(server);
let usersList = [];
io.on("connection", socket => {
  console.log("User connected");
  socket.on("addMessage", messageDtls => {
    // messagesRecieved = message.messageText;
    console.log("Message received : " + messageDtls.messageText);
    socket.broadcast.emit("messageAdded", messageDtls);
  });
  socket.on("addUser", userName => {
    // messagesRecieved = message.messageText;
    console.log("Message received : " + userName);
    usersList.push(userName);
    console.log(usersList);
    socket.broadcast.emit("userAdded", usersList);
  });
});

server.listen(port, () => {
  console.log("Server listening on port " + port);
});
server.on("error", helperFunction.onError);
