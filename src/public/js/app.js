// socket.io에 기본 내장된 io 메소드를 가져온다 
// io 메소드는 알아서 socket.io를 실행하고 있는 서버를 찾는다.
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li")
    li.innerText = message;
    ul.appendChild(li);
};

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You :${value}`);
    });
    input.value = "";
}

function handleNicknameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname", input.value);
};

// emit()함수의 맨 마지막 argument에서 호출되어 sever에선 done() 메소드를 실행하지만
// backendDone()메소드를 호출한다. (보안때문에 이렇게 코딩함)
// front-end에서 실행 된 코드를 back-end가 실행을 시켰다.
function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText=`Room ${roomName}`;
    const msgform = room.querySelector("#msg");
    const nameform = room.querySelector("#name");
    msgform.addEventListener("submit", handleMessageSubmit);
    nameform.addEventListener("submit", handleNicknameSubmit);
};

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");

    // 전에는 Javascript를 String 으로 변환해서 보내야했지만 socket.io를 사용하면 Object 그대로 보내도된다
    socket.emit("enter_room", input.value, showRoom);
     // emit()의 마지막 argument에서 back-end에 보내는 함수를 적을 수 있다.
    roomName = input.value;
    input.value = "";
};

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText=`Room ${roomName} (${newCount})`;
    addMessage(`${user} arrived`);
});

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText=`Room ${roomName} (${newCount})`;
    addMessage(`${left} left ㅠㅠ!`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms)=>{
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if(rooms.length === 0){
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});
// const messageList = document.querySelector("ul");
// const nickForm = document.querySelector("#nick");
// const messageForm = document.querySelector("#message");
// // socket -> 서버로 부터의 연결 (브라우저와 서버간의)
// const socket = new WebSocket(`ws://${window.location.host}`);

// function makeMessage(type, payload){
//     //String을 보내기전에 Object를 만들고  JSON문자열로 반환한다.
//     const msg = {type, payload};
//     return JSON.stringify(msg);
// }


// socket.addEventListener("open", () => {
//     console.log("Connected to Server check!!!");
// });

//  //socket.addEventListener("message", (message)=>{
//  //    const li = document.createElement("li");
//  //    li.innerText = message.data;
//  //    messageList.append(li);
//  //});

// socket.addEventListener('message', async (message) => {
//      if (typeof message.data === 'string') {
//         const li = document.createElement("li");
//         li.innerText = message.data;
//         messageList.append(li);

//         //console.log(message.data);
//      } else {

//          const messageText = await message.data.text();
//          const li = document.createElement("li");
//          li.innerText = messageText;
//          messageList.append(li);

//          //console.log(messageText);
//      }
//  });


// socket.addEventListener("close", () => {
//     console.log("DisConnected to Server Close@@@");
// });

// function handleSubmit(event) {
//     event.preventDefault();
//     const input = messageForm.querySelector("input");
//     socket.send(makeMessage("new_message", input.value));
//     input.value = "";
// };


// function handleNickSubmit(event){
//     event.preventDefault();
//     const input = nickForm.querySelector("input");

//     //문자열로 보내야하니 JSON Object를 전달한다
//     socket.send(makeMessage("nickname", input.value));
//     input.value = "";
// };

// messageForm.addEventListener("submit", handleSubmit);
// nickForm.addEventListener("submit", handleNickSubmit);