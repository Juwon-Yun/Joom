##  P2P Video Chat With Node.Js

# ๐จ๐ปโ๐ง What
Node.Js์ Socket.Io์ candidate๋ฅผ ์ด์ฉํ P2P ํ์ ์ฑํ ์น ์ดํ๋ฆฌ์ผ์ด์์๋๋ค.

#  ๐ How

```js
$npm install -g localtunnel
$npm install
$npm run dev

if(globalURL){
    $lt --port port_number
}
```

๋ฐฉ ์ด๋ฆ ์๋ ฅ ํ ์นด๋ฉ๋ผ ๋ฐ ๋ง์ดํฌ ๊ถํ ํ์ฉํด์ผ ๊ธฐ๋ฅ์ ์คํํ  ์ ์์ต๋๋ค.

# ๐ Review
![image](https://user-images.githubusercontent.com/85836879/171527635-f395d59a-1541-4938-bc9d-b767c5c6ea52.png)

Mesh ๋ฐฉ์์ด ์๋ MCU ํน์ SFU๋ฐฉ์์ผ๋ก ๊ตฌํํ๊ณ  ์ถ์์ง๋ง 

candidate๋ฅผ ์ฒ๋ฆฌํด์ค ์ค๊ฐ ์๋ฒ๊ฐ ์กด์ฌํด์ผํ๋ค. 

AWS๋ ์ผ๋ฐ ์๋ฒ๋ก ์ค๊ณํ๊ณ  ์ถ์ง๋ง ํธ๋ํฝ ๊ด๋ฆฌ ๋ถ๋ถ์ด ๋ฏธํกํด ์งํํ๊ธฐ ์ด๋ ค์ ๋ค.

๋ฅด๋ธ๋์ ๋ฒ์น์ด ์๋ ์ดํ์ ๋ด๊ฐ ๋ ์ฑ์ฅํ๋ค๋ฉด ๊ฐ์ธ ํ๋ก์ ํธ๋ก MCU ํน์ SFU๋ฐฉ์์ ํ์์ฑํ์ ๊ตฌํํ๊ณ  ์ถ๋ค.

# ๐ก Tips
๋ณด๋ค ์ ๋ฌธ์ ์ธ ์๋น์ค๋ ์ค์  ์๋น์ค๋ฅผ ํ๊ณ  ์ถ๋ค๋ฉด ๊ฐ๋ณ์ ์ธ STUN ์๋ฒ๋ฅผ ์ด์ํด์ผํฉ๋๋ค.

ํ์ฌ ์ฝ๋๋ ๊ตฌ๊ธ์์ ๋ฌด๋ฃ๋ก ์ ๊ณตํด์ฃผ๋ STUN์๋ฒ๋ฅผ ์ฌ์ฉํ๊ณ  ์์ต๋๋ค.

์๋์ด ๋์ง์๋๋ค๋ฉด ๋ฌด๋ฃ STUN์๋ฒ๋ฅผ ์ฃผ์ํ๊ณ  globaltunnel ๋ช๋ น์ด๋ฅผ ์๋ ฅํด ์ฌ์ฉํ  ์ ์์ต๋๋ค.