import { defineStore } from "pinia";
export const useSettingStore = defineStore("setting", {
  state: () => ({
    chatList: [],
    qq: "2480321637",
    name: "",
  }),
  getters: {
    double: (state) => state.count * 2,
  },
  actions: {
    setList(data) {
      this.chatList = data;
    },
    pushList(data) {
      this.chatList.push(data);
    },
    updateList(data) {
      if (this.chatList.length == 0) {
        this.chatList.unshift(data);
      }
      let isHave = -1;
      
      for (let i = 0; i < this.chatList.length; i++) {
        let rr = this.chatList[i];
        if (rr.qq == data.qq && data.talk_type == 1 && rr.qq!=undefined) {
          isHave = i;
          break;
        }
        if (rr.group == data.group && data.talk_type == 2 && rr.group!=undefined && data.group!=undefined) {
          isHave = i;
          break;
        }
      }
      if (isHave == -1) {
        //将新数据添加到开头
        console.log("add");
        this.chatList.unshift(data);
      } else {
        console.log("update");
        //更新
        this.chatList[isHave].unread++;
        let temp = this.chatList[isHave];
        this.chatList=this.chatList.filter((currentValue,index,arr)=>{
          arr;currentValue;
          return index!=isHave;
        });
        temp.msg_text=data.msg_text;
        this.chatList.unshift(temp);
      }
    },
    updateListApi(data) {
      if (this.chatList.length == 0) {
        this.chatList.unshift(data);
      }
      let isHave = -1;
      
      for (let i = 0; i < this.chatList.length; i++) {
        let rr = this.chatList[i];
        if (rr.qq == data.qq && data.talk_type == 1 && rr.qq!=undefined) {
          isHave = i;
          break;
        }
        if (rr.group == data.group && data.talk_type == 2 && rr.group!=undefined && data.group!=undefined) {
          isHave = i;
          break;
        }
      }
      if (isHave == -1) {
        //将新数据添加到开头
        console.log("add");
        this.chatList.unshift(data);
      } else {
        console.log("update");
        //不更新
        this.chatList[isHave].msg_text=data.msg_text;
        this.chatList[isHave].time=data.time
      }
    },
  },
});
