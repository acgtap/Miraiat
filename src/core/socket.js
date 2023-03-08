import { io } from "socket.io-client";
import { Snackbar } from '@varlet/ui'

export function initSocket(){
  let snack=Snackbar['loading']("正在连接服务器...");
  const socket = io("ws://127.0.0.1:3000");

//socket.emit("hello from server", 5, "6", { 7: Uint8Array.from([8]) });

// 从服务器接收消息
socket.on("connect", () => {
  snack.clear();//连接成功
  let success=Snackbar['success']("连接服务器成功");
  setTimeout(() => {
    success.clear()
  }, 2000)
  socket.on("chat", (...args) => {
    console.log(...args)
  });
});

socket.on("disconnect", () => {
  let success=Snackbar['danger']("与服务器连接断开");
  setTimeout(() => {
    success.clear()
  }, 2000)
});
}
