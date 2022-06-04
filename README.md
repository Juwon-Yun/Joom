##  P2P Video Chat With Node.Js

# 👨🏻‍🔧 What
Node.Js와 Socket.Io의 candidate를 이용한 P2P 화상 채팅 웹 어플리케이션입니다.

#  🚀 How

```js
$npm install -g localtunnel
$npm install
$npm run dev

if(globalURL){
    $lt --port port_number
}
```

방 이름 입력 후 카메라 및 마이크 권한 허용해야 기능을 실행할 수 있습니다.

# 📖 Review
![image](https://user-images.githubusercontent.com/85836879/171527635-f395d59a-1541-4938-bc9d-b767c5c6ea52.png)

Mesh 방식이 아닌 MCU 혹은 SFU방식으로 구현하고 싶었지만 

candidate를 처리해줄 중간 서버가 존재해야한다. 

AWS나 일반 서버로 중계하고 싶지만 트래픽 관리 부분이 미흡해 진행하기 어려웠다.

르블랑의 법칙이 아닌 이후에 내가 더 성장한다면 개인 프로젝트로 MCU 혹은 SFU방식의 화상채팅을 구현하고 싶다.

# 💡 Tips
보다 전문적인 서비스나 실제 서비스를 하고 싶다면 개별적인 STUN 서버를 운영해야합니다.

현재 코드는 구글에서 무료로 제공해주는 STUN서버를 사용하고 있습니다.

작동이 되지않는다면 무료 STUN서버를 주석하고 globaltunnel 명령어를 입력해 사용할 수 있습니다.