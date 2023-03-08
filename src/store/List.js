import { defineStore } from "pinia";
export const useListStore = defineStore("list", {
  state: () => ({
    chatList: [],
    records: [],
    qqList:['2480321637','3386298827'],
    qq: "3386298827",
    name: "",
    nums: {
      friend: 0,
      group: 0,
    },
    actions: {
      setList(data) {
        this.chatList=data;
      },
      pushList(data){
        this.chatList.push(data);
      },
      updateList(data){
        if(this.chatList.length==0){
          this.chatList.unshift(data);
        }
        for(let [index,rr] of this.chatList.entries()){
          if(rr.qq==data.qq){
            console.log('no update')
            //不更新
            this.chatList[index].unread++;
            this.chatList[index].msg_text=data.msg_text;
          }else{
            //将新数据添加到开头
            this.chatList.unshift(data);
          }
        }
        
      }
    },
    updateGroupNum(data) {
      this.nums.group = data;
    },
    pushRecords(data) {
      this.records.push(data);
    },
    recordWatchUpdate() {
      this.recordWatch.push(new Date().getTime().toString());
    },
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
        if (rr.qq == data.qq && data.talk_type == 1 && rr.qq != undefined) {
          isHave = i;
          break;
        }
        if (
          rr.group == data.group &&
          data.talk_type == 2 &&
          rr.group != undefined &&
          data.group != undefined
        ) {
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
        this.chatList = this.chatList.filter((currentValue, index, arr) => {
          arr;
          currentValue;
          return index != isHave;
        });
        temp.msg_text = data.msg_text;
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
        if (rr.qq == data.qq && data.talk_type == 1 && rr.qq != undefined) {
          isHave = i;
          break;
        }
        if (
          rr.group == data.group &&
          data.talk_type == 2 &&
          rr.group != undefined &&
          data.group != undefined
        ) {
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
        this.chatList[isHave].msg_text = data.msg_text;
        this.chatList[isHave].time = data.time;
      }
    },
  },
});
