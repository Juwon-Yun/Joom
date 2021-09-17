import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname +"/views");
app.use("/public", express.static(__dirname+"/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// http 서버 만들기 
const server = http.createServer(app);

// Websocket 서버 만들기 (이렇게하면 http, ws 서버 두개를 돌릴 수 있다, 같은 포트(3000)으로 만들기 위해 둘다 선언)
const wss = new WebSocket.Server({ server });

const sockets = [];

// socket -> 연결된 브라우저를 표시, connection이 생기면 socket을 받는 함수
wss.on("connection", (socket)=>{
    
    sockets.push(socket);
    socket["nickname"] = "익명";
    console.log("Connected to Browser check!!!");

    // 익명 함수 () => {};
    socket.on("close", ()=>{
        console.log("DisConnected from the Browser Close@@@");
    });

    socket.on("message", (msg)=>{
        const message = JSON.parse(msg);
        // console.log(parsed, message, parsed.type, parsed.payload);

        switch(message.type){
            case "new_message":
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname}:${message.payload}`));
                break;
            case "nickname":
                //console.log(message.payload);
                //닉네임을 입력했을경우
                socket["nickname"] = message.payload;
                break;
        }
    });

    //socket.on('message', (message, isBinary) => {
    //    const messageString = isBinary ? message : message.toString('utf8');
    //    socket.send(messageString);
    //});

    //socket.send("hello!!!");
});

// http서버 위에 ws 서버를 만듬 (3000번 포트에서 http, ws 두곳의 request를 처리할 수 있다)
server.listen(3000, handleListen);


