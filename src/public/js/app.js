// socket.io에 기본 내장된 io 메소드를 가져온다 
// io 메소드는 알아서 socket.io를 실행하고 있는 서버를 찾는다.
const socket = io();

//lt --port 3100 // global url 생성

// WebRTC => Web Real - Time Communication (peer to peer) 
// 비디오 오디오 텍스트가 서버로 들렸다 상대에 가지않고 곧장 간다(서버엔 signal만 보냄)

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;

async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        // 사용 가능한 입출력 장치 보기
        //console.log(devices);
        
        const cameras = devices.filter(device => device.kind ==="videoinput");
        // 사용할 수 있는 카메라 배열 보기
        //console.log(cameras);

        const currentCamera = myStream.getVideoTracks()[0];

        cameras.forEach(camera=>{
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if(currentCamera.label == camera.label){
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        });
    }catch(e){console.log(e)};
}

async function getMedia(deviceId){
    const initialConstrains = {
         audio: true,
         video: { facingMode: "user" },
    };
    const cameraConstraints = {
        audio : true,
        video : { deviceId : { exact: deviceId} },
    };
    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstrains
        );
        myFace.srcObject = myStream;
        if (!deviceId){
            await getCameras();
        }
    } catch(e) {
        console.log(e);
    }
}

// getMedia();

function handleMuteClick(){
    myStream.getAudioTracks().forEach( (track) => (track.enabled = !track.enabled) );
    // 마이크 요소 보기
    //console.log(myStream.getAudioTracks());
    if(!muted){
        muteBtn.innerText = "음소거 해제";
        muted = true;
    }else{
        muteBtn.innerText = "음소거";
        muted = false;
    }
};
function handleCameraClick(){
    myStream.getVideoTracks().forEach( (track) => (track.enabled = !track.enabled) );
    // 카메라 요소 보기
    //console.log(myStream.getVideoTracks());
    if(cameraOff){
        cameraBtn.innerText = "카메라 끄기";
        cameraOff = false;
    }else{
        cameraBtn.innerText = "카메라 켜기";
        cameraOff = true;
    }
};

async function handleCameraChange(){
    await getMedia(camerasSelect.value);
    if(myPeerConnection){
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection
            .getSenders()
            .find((sender)=> sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
    }
};

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
};

async function handleWelcomSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room",input.value);
    roomName = input.value;
    input.value ="";
};

welcomeForm.addEventListener("submit", handleWelcomSubmit);

// Socket Code

// Peer A
// getUserMedia()
// addStream()
// createOffer()
// setLocalDescription()

// Peer B
// setRemoteDescription()
// getUserMedia()
// addStream()
// createAnswer()
// setLocalDescription()

// Peer A
socket.on("welcome", async ()=> {
    myDataChannel = myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message", console.log);
    console.log("made data channel");
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");
    socket.emit("offer", offer, roomName);
});

// offer가 주고 받아진 순간 직접적으로 대화를 할 수 있다.

// Peer B
socket.on("offer", async(offer) => {
    myPeerConnection.addEventListener("datachannel", (event)=>{
        myDataChannel = event.channel;
        myDataChannel.addEventListener("message", console.log);
    });
    console.log("received the offer");
    myPeerConnection.setRemoteDescription(offer);
    // offer 가 도착했지만 myPeerConnection은 아직 도착하지 않았기 때문에 에러    
    const answer = await myPeerConnection.createAnswer();
    console.log(answer);
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log("sent the answer");
});

socket.on("answer", answer =>{
    console.log("received the answer");
    // Peer A는 Peer B가 보낸 emit으로 인해 setRemoteDescription을 가질 수 있어졌다.
    myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", ice=>{
    console.log("received candidate");
    myPeerConnection.addIceCandidate(ice);
});

// RTC Code

function makeConnection(){
    // 공용주소를 이용해 peer to peer 접속하기(구글 stun 서버 사용)
    myPeerConnection = new RTCPeerConnection(
    //     {
    //     iceServers : [
    //         {
    //             url : [
    //                 "stun:stun.l.google.com:19302",
    //                 "stun:stun1.l.google.com:19302",
    //                 "stun:stun2.l.google.com:19302",
    //                 "stun:stun3.l.google.com:19302",
    //                 "stun:stun4.l.google.com:19302",
    //             ],
    //         },
    //     ],
    // }
    );
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream
    .getTracks()
    .forEach((track)=>myPeerConnection.addTrack(track, myStream));
};

function handleIce(data){
    console.log("sent candidate");
    // Peer A와 Peer B가 candidate들을 서로 주고 받는다는 뜻
    socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data){
    const peerFace = document.getElementById("peerFace");
    console.log("got an event from my peer");
    console.log("Peer's Stream : ", data.stream);
    console.log("My Stream : ", myStream);

    peerFace.srcObject = data.stream;
};


// =========================Socket.io 사용한 채팅===================================
// const welcome = document.getElementById("welcome");
// const form = welcome.querySelector("form");
// const room = document.getElementById("room");

// room.hidden = true;

// let roomName;

// function addMessage(message){
//     const ul = room.querySelector("ul");
//     const li = document.createElement("li")
//     li.innerText = message;
//     ul.appendChild(li);
// };

// function handleMessageSubmit(event){
//     event.preventDefault();
//     const input = room.querySelector("#msg input");
//     const value = input.value;
//     socket.emit("new_message", input.value, roomName, () => {
//         addMessage(`You :${value}`);
//     });
//     input.value = "";
// }

// function handleNicknameSubmit(event){
//     event.preventDefault();
//     const input = room.querySelector("#name input");
//     socket.emit("nickname", input.value);
// };

// // emit()함수의 맨 마지막 argument에서 호출되어 sever에선 done() 메소드를 실행하지만
// // backendDone()메소드를 호출한다. (보안때문에 이렇게 코딩함)
// // front-end에서 실행 된 코드를 back-end가 실행을 시켰다.
// function showRoom(){
//     welcome.hidden = true;
//     room.hidden = false;
//     const h3 = room.querySelector("h3");
//     h3.innerText=`Room ${roomName}`;
//     const msgform = room.querySelector("#msg");
//     const nameform = room.querySelector("#name");
//     msgform.addEventListener("submit", handleMessageSubmit);
//     nameform.addEventListener("submit", handleNicknameSubmit);
// };

// function handleRoomSubmit(event){
//     event.preventDefault();
//     const input = form.querySelector("input");

//     // 전에는 Javascript를 String 으로 변환해서 보내야했지만 socket.io를 사용하면 Object 그대로 보내도된다
//     socket.emit("enter_room", input.value, showRoom);
//      // emit()의 마지막 argument에서 back-end에 보내는 함수를 적을 수 있다.
//     roomName = input.value;
//     input.value = "";
// };

// form.addEventListener("submit", handleRoomSubmit);

// socket.on("welcome", (user, newCount) => {
//     const h3 = room.querySelector("h3");
//     h3.innerText=`Room ${roomName} (${newCount})`;
//     addMessage(`${user} arrived`);
// });

// socket.on("bye", (left, newCount) => {
//     const h3 = room.querySelector("h3");
//     h3.innerText=`Room ${roomName} (${newCount})`;
//     addMessage(`${left} left ㅠㅠ!`);
// });

// socket.on("new_message", addMessage);

// socket.on("room_change", (rooms)=>{
//     const roomList = welcome.querySelector("ul");
//     roomList.innerHTML = "";
//     if(rooms.length === 0){
//         return;
//     }
//     rooms.forEach(room => {
//         const li = document.createElement("li");
//         li.innerText = room;
//         roomList.append(li);
//     });
// });
// =========================Socket.io 사용한 채팅===================================

// =========================Socket.io 없는 채팅===================================
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
// =========================Socket.io 없는 채팅===================================