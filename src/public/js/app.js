// socket -> 서버로 부터의 연결 (브라우저와 서버간의)
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", ()=>{
    console.log("Connected to Server check!!!");
});

socket.addEventListener("message", (message)=>{
    console.log("New Message : ", message.data);
});

socket.addEventListener("close", ()=>{
    console.log("DisConnected to Server Close@@@");
});

setTimeout(()=>{
    socket.send("hello from the browser!");
},5000);