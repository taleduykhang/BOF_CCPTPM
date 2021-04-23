// Chuẩn bị môi trường
var express = require('express');
var app = express();
var fs = require('fs');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 9000;
var loopLimit = 0;

//set port 
server.listen(port, function () {
  console.log('Server listening at port %d', port);
  fs.writeFileSync(__dirname + '/start.log', 'started');
});


app.use(express.static(__dirname));


var gameCollection = new function () {

  this.totalGameCount = 0,
    this.gameList = []

};

function buildGame(socket) { //khi bắt đầu chat
  var gameObject = {};
  gameObject.id = (Math.random() + 1).toString(36).slice(2, 18);
  gameObject.playerOne = socket.username;
  gameObject.playerTwo = null;
  gameCollection.totalGameCount++;
  gameCollection.gameList.push({ gameObject });

  console.log("Game Created by " + socket.username + " w/ " + gameObject.id);
  io.emit('gameCreated', {
    username: socket.username,
    gameId: gameObject.id
  });


}

function killGame(socket) { // kết thúc

  var notInGame = true;
  for (var i = 0; i < gameCollection.totalGameCount; i++) {

    var gameId = gameCollection.gameList[i]['gameObject']['id']
    var plyr1Tmp = gameCollection.gameList[i]['gameObject']['playerOne'];
    var plyr2Tmp = gameCollection.gameList[i]['gameObject']['playerTwo'];

    if (plyr1Tmp == socket.username) {
      --gameCollection.totalGameCount;
      console.log("Destroy Game " + gameId + "!");
      gameCollection.gameList.splice(i, 1);
      console.log(gameCollection.gameList);
      socket.emit('leftGame', { gameId: gameId });
      io.emit('gameDestroyed', { gameId: gameId, gameOwner: socket.username });
      notInGame = false;
    }
    else if (plyr2Tmp == socket.username) {
      gameCollection.gameList[i]['gameObject']['playerTwo'] = null;
      console.log(socket.username + " has left " + gameId);
      socket.emit('leftGame', { gameId: gameId });
      console.log(gameCollection.gameList[i]['gameObject']);
      notInGame = false;

    }

  }

  if (notInGame == true) {
    socket.emit('notInGame');
  }


}

function gameSeeker(socket) {  // tạo mã phòng khi vào đc
  ++loopLimit;
  if ((gameCollection.totalGameCount == 0) || (loopLimit >= 20)) {

    buildGame(socket);
    loopLimit = 0;

  } else {
    var rndPick = Math.floor(Math.random() * gameCollection.totalGameCount);
    if (gameCollection.gameList[rndPick]['gameObject']['playerTwo'] == null) {
      gameCollection.gameList[rndPick]['gameObject']['playerTwo'] = socket.username;
      socket.emit('joinSuccess', {
        gameId: gameCollection.gameList[rndPick]['gameObject']['id']
      });

      console.log(socket.username + " has been added to: " + gameCollection.gameList[rndPick]['gameObject']['id']);

    } else {

      gameSeeker(socket);
    }
  }
}


var numUsers = 0;

io.on('connection', function (socket) { // tạo kết nói
  var addedUser = false;

  socket.on('new message', function (data) { // nhắn tin
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  socket.on('add user', function (username) { // thêm người chat
    if (addedUser) return;

    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    socket.broadcast.emit('user joined', { // vào phòng thành công
      username: socket.username,
      numUsers: numUsers
    });
  });

  socket.on('typing', function () { // hiển thị chữ đang nhập
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  socket.on('stop typing', function () {  // mất chữ đang nhập
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  socket.on('disconnect', function () { // ngắt kết nối 
    if (addedUser) {
      --numUsers;
      killGame(socket);

      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });


  socket.on('joinGame', function () {  // hiển thị đôi tượng muốn vào phòng chat
    console.log(socket.username + " wants to join a game");

    var alreadyInGame = false;

    for (var i = 0; i < gameCollection.totalGameCount; i++) {
      var plyr1Tmp = gameCollection.gameList[i]['gameObject']['playerOne'];
      var plyr2Tmp = gameCollection.gameList[i]['gameObject']['playerTwo'];
      if (plyr1Tmp == socket.username || plyr2Tmp == socket.username) {
        alreadyInGame = true;
        console.log(socket.username + " already has a Game!");

        socket.emit('alreadyJoined', {
          gameId: gameCollection.gameList[i]['gameObject']['id']
        });

      }

    }
    if (alreadyInGame == false) {


      gameSeeker(socket);

    }

  });


  socket.on('leaveGame', function () { // rời phòng chát


    if (gameCollection.totalGameCount == 0) {
      socket.emit('notInGame');

    }

    else {
      killGame(socket);
    }

  });

});



