import http from "http";
import SocketIO from "socket.io";
//import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname +"/views");
app.use("/public", express.static(__dirname+"/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3100`);

// http 서버 만들기 
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

function publicRooms(){
    const {
        sockets: {
            adapter:{sids, rooms},
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_,key)=>{
        if(sids.get(key)===undefined){
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}


wsServer.on("connection", (socket)=>{
    socket["nickname"] = "익명";
    socket.onAny( (event)=>{
        console.log(`Socket Event: ${event}`);
    })
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", ()=>{
        console.log(socket.rooms);
        socket.rooms.forEach( (room)=>
            socket.to(room).emit("bye", socket.nickname, countRoom(room)-1)
        );
    });
    socket.on("disconnect", ()=>{
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("new_message", (msg, room, done)=>{
        socket.to(room).emit("new_message", `${socket.nickname}:${msg}`);
        done();
    });
    socket.on("nickname", (nickname)=>(socket["nickname"]=nickname));
});

// Websocket 서버 만들기 (이렇게하면 http, ws 서버 두개를 돌릴 수 있다, 같은 포트(3000)으로 만들기 위해 둘다 선언)
//const wss = new WebSoc ket.Server({ server });

// const sockets = [];

// socket -> 연결된 브라우저를 표시, connection이 생기면 socket을 받는 함수
// wss.on("connection", (socket)=>{
    
//     sockets.push(socket);
//     socket["nickname"] = "익명";
//     console.log("Connected to Browser check!!!");

//     // 익명 함수 () => {};
//     socket.on("close", ()=>{
//         console.log("DisConnected from the Browser Close@@@");
//     });

//     socket.on("message", (msg)=>{
//         const message = JSON.parse(msg);
//         // console.log(parsed, message, parsed.type, parsed.payload);

//         switch(message.type){
//             case "new_message":
//                 sockets.forEach(aSocket => aSocket.send(`${socket.nickname}:${message.payload}`));
//                 break;
//             case "nickname":
//                 //console.log(message.payload);
//                 //닉네임을 입력했을경우
//                 socket["nickname"] = message.payload;
//                 break;
//         }
//     });

    //socket.on('message', (message, isBinary) => {
    //    const messageString = isBinary ? message : message.toString('utf8');
    //    socket.send(messageString);
    //});

    //socket.send("hello!!!");
//});

// http서버 위에 ws 서버를 만듬 (3000번 포트에서 http, ws 두곳의 request를 처리할 수 있다)
httpServer.listen(3100, handleListen);


