const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
// socket -> 서버로 부터의 연결 (브라우저와 서버간의)
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload){
    //String을 보내기전에 Object를 만들고  JSON문자열로 반환한다.
    const msg = {type, payload};
    return JSON.stringify(msg);
}


socket.addEventListener("open", () => {
    console.log("Connected to Server check!!!");
});

 //socket.addEventListener("message", (message)=>{
 //    const li = document.createElement("li");
 //    li.innerText = message.data;
 //    messageList.append(li);
 //});

socket.addEventListener('message', async (message) => {
     if (typeof message.data === 'string') {
        const li = document.createElement("li");
        li.innerText = message.data;
        messageList.append(li);

        //console.log(message.data);
     } else {

         const messageText = await message.data.text();
         const li = document.createElement("li");
         li.innerText = messageText;
         messageList.append(li);

         //console.log(messageText);
     }
 });


socket.addEventListener("close", () => {
    console.log("DisConnected to Server Close@@@");
});

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    input.value = "";
};


function handleNickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector("input");

    //문자열로 보내야하니 JSON Object를 전달한다
    socket.send(makeMessage("nickname", input.value));
    input.value = "";
};

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);