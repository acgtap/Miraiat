<template>
  <div
    :style="
      'height:100%;background: url(' + setting.background + ') top center fixed;'
    "
  >
    <var-app-bar class="topbar" :color="setting.backgroundColor" :title="nickname">
      <template #left>
        <var-button
          color="transparent"
          text-color="#ffffff"
          round
          text
          @click="this.$router.back()"
        >
          <var-icon name="chevron-left" :size="24" />
        </var-button>
        <div class="userlogotop" v-popover:usercard>
          <img
            :src="getAvatar(talk_type, receiver_id)"
            :onerror="detaultAvatar"
          />
        </div>
      </template>

      <template #right>
        <var-button
          color="transparent"
          text-color="#ffffff"
          round
          text
          @click="openmenu"
        >
          <var-icon name="menu" :size="24" />
        </var-button>
      </template>
    </var-app-bar>

    <!-- 主体信息 -->
    <el-scrollbar
      ref="myScrollbar"
      id="el-scrollbar"
      :style="'height: ' + this.lessHeight + 'px;margin-top: 55px;'"
      @scroll="orderScroll($event)"
    >
      <el-main class="main-box no-padding">
        <div id="lumenChatPanel" class="talks-container lum-scrollbar">
          <!-- 数据加载状态栏 -->
          <div class="loading-toolbar">
            <span v-show="loadRecord.status == 0" class="color-blue">
              <i class="el-icon-loading" />
              <var-loading type="circle" />正在加载数据中...
            </span>
            <span
              v-show="loadRecord.status == 1"
              class="pointer color-blue"
              @click="loadChatRecords"
            >
              <i class="el-icon-bottom" /> 查看更多消息...
            </span>
            <span v-show="loadRecord.status == 2"> 没有更多消息了... </span>
          </div>

          <!-- 消息主体 -->
          <TransitionGroup name="list" tag="ul">
            <div v-for="(item, idxs) in records" :key="item.time">
               <!-- 消息时间 -->
              <div v-if="isShowTime((records[idxs - 1] ? records[idxs - 1].time :new Date().getTime())/1000,parseInt(parseInt(item.time)/1000))" class="datetime no-select" v-text="this.beautifyTimes(item.time)" />
              <!-- 其它对话消息 -->
              <div
                class="message-box record-box"
                :class="{
                  'direction-rt': item.float == 'right',
                }"
              >
                <aside class="avatar-column" @click="openInfo(item.qq)">
                  <el-image
                    style="width: 35px; height: 35px"
                    loading="lazy"
                    class="pointer"
                    :size="30"
                    :src="item.avatar"
                  />
                </aside>
                <main class="main-column">
                  <div class="talk-title">
                    <span
                      v-show="
                        talk_type == 1 ||
                        (talk_type == 2 && item.float == 'right')
                      "
                      class="time"
                    >
                      <i class="el-icon-time" />
                      <u-time :value="item.time" />
                    </span>
                  </div>

                  <div class="talk-content">
                    <span v-show="talk_type != 1" class="nickname">
                      {{ item.name }} |{{ idxs }}
                    </span>

                    <!-- 文本消息 -->
                    <text-message
                      v-if="1 == 1"
                      :content="item.msg"
                      :talk_type="talk_type"
                      :float="item.float"
                      :full-width="false"
                      :arrow="true"
                      :key="item.time"
                    ></text-message>
                    <var-loading
                      v-if="loadRecord.sending == 1 && item.type == 'sending'"
                      type="circle"
                      size="mini"
                    />
                  </div>
                </main>
              </div>

              
            </div>
          </TransitionGroup>
        </div>
      </el-main>
    </el-scrollbar>

    <div class="editor">
      <div class="editor_outer">
        <var-input placeholder="说点什么吧..." v-model="value">
          <template #append-icon>
            <var-button class="sendbtn" text type="primary" @click="sendMessage"
              >发送</var-button
            >
          </template>
        </var-input>
      </div>
    </div>

    <!-- 删除好友提示框 -->
    <var-popup :default-style="false" v-model:show="delFriendShow">
      <el-result
        icon="warning"
        title="确认删除"
        sub-title="这个删除无法撤销，谨慎操作！"
      >
        <template #extra>
          <el-button type="primary" @click="delFriendShow = false"
            >返回</el-button
          >
          <el-button type="primary" @click="removeFriend">确认删除</el-button>
        </template>
      </el-result>
    </var-popup>

    <!-- 好友资料 -->
    <var-action-sheet :actions="userInfo" v-model:show="userInfoShow"
      ><template #title>
        <var-row>
          <var-col :span="5"
            ><img
              class="mylogo"
              :src="
                'http://q2.qlogo.cn/headimg_dl?dst_uin=' + user.qq + '&spec=100'
              "
          /></var-col>
          <var-col :span="19"
            ><div>
              <div>{{ user.nickname }}({{ user.level }}级)</div>
              <small>{{ user.sign }}</small>
            </div></var-col
          ></var-row
        >
      </template>
    </var-action-sheet>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useListStore } from "../../store/List";
import { mapWritableState } from "pinia";
import { getChatRecord } from "../../api/all";
import { bot, Message } from "../../core/mirai";
import UTime from "../message/utime.vue";
import { ActionSheet } from "@varlet/ui";
import { debounce, beautifyTime } from "../../core/func";
import { Snackbar } from "@varlet/ui";
export default defineComponent({
  setup() {},
  computed: {
    ...mapWritableState(useListStore, [
      "chatList",
      "qq",
      "records",
      "isOpenPlane",
      "recordWatch",
      "setting"
    ]),
  },
  props: ["talk_type", "receiver_id", "nickname", "index"],
  components: {
    UTime,
  },
  mounted() {
    console.log(this.talk_type);
    this.height = window.outerHeight;
    this.lessHeight = window.outerHeight - 59 - 59;
    console.log("window.innerHeight", window.innerHeight);
    console.log("window.outerHeight", window.outerHeight);
  },
  data() {
    return {
      value: "",
      // 记录加载相关参数
      detaultAvatar: "",
      loadRecord: {
        status: 2,
        minRecord: 0,
        sending: 0,
      },
      menus: [
        {
          id: 0,
          name: "加载中",
        },
      ],
      isRefresh: false,
      page: 0,
      scrollbarRef: [],
      delFriendShow: false,
      userInfoShow: false,
      user: {},
      userInfo: [],
      height: 800,
      lessHeight: 800,
    };
  },
  watch: {
    recordWatch: {
      handler(newQuestion, oldQuestion) {
        newQuestion;
        oldQuestion;
        console.log("watch records change");
        let that = this;
        setTimeout(() => {
          that.toBottom();
        }, 1000);
      },
      deep: true,
    },
  },

  methods: {
    /**
         * 判断是否需要显示时间戳（上下超过五分钟的消息）
         * @param timePrv 上条消息的时间戳（10 位）
         * @param timeNow 当前消息的时间戳（10 位）
         */
        isShowTime (timePrv, timeNow, alwaysShow = false) {
          
            if(alwaysShow) return true
            if(timePrv == undefined) return false
            // 五分钟 10 位时间戳相差 300
            return timeNow-timePrv>= 3000
        },
        beautifyTimes(time){
          return beautifyTime(time);
        },
    async openInfo(id) {
      if (this.talk_type == 1) {
        this.openUserInfo();
      } else if (this.talk_type == 2) {
        this.openGroupMemberInfo(id);
      }
    },
    async openGroupMemberInfo(id) {
      console.log("openGroupMemberInfo", id, " from ", this.receiver_id);
      let userinfo = await bot.getUserProfile({ qq: id });
      let inGroupInfo = await bot.getMemberInfo({
        qq: id,
        group: this.receiver_id,
      });

      console.log(inGroupInfo);
      this.user = userinfo;
      this.user.qq = id;
      this.userInfo = [
        {
          name: "Sex：" + userinfo.sex,
          icon: "wifi",
          color: "#00afef",
        },
        {
          name: "Email：" + userinfo.email,
          icon: "account-circle",
          color: "#00c48f",
        },
        {
          name: "Age：" + userinfo.age,
          icon: "notebook",
          color: "#ff9800",
        },
        {
          name: "Permission：" + inGroupInfo.permission,
          icon: "account-circle",
          color: "#00c48f",
        },
        {
          name:
            "LastSpeakTimestamp：" +
            beautifyTime((inGroupInfo.lastSpeakTimestamp * 1000).toString()),
          icon: "wifi",
          color: "#00afef",
        },
        {
          name:
            "JoinTimestamp：" +
            beautifyTime((inGroupInfo.joinTimestamp * 1000).toString()),
          icon: "account-circle",
          color: "#00c48f",
        },
        {
          name: "Title ：" + inGroupInfo.title,
          icon: "account-circle",
          color: "#00c48f",
        },
      ];
      this.userInfoShow = true;
    },
    async openUserInfo() {
      let userinfo = await bot.getUserProfile({ qq: this.receiver_id });
      console.log(userinfo);
      this.user = userinfo;
      this.user.qq = this.receiver_id;
      this.userInfo = [
        {
          name: "Sex：" + userinfo.sex,
          icon: "wifi",
          color: "#00afef",
        },
        {
          name: "Email：" + userinfo.email,
          icon: "account-circle",
          color: "#00c48f",
        },
        {
          name: "Age：" + userinfo.age,
          icon: "notebook",
          color: "#ff9800",
        },
      ];
      this.userInfoShow = true;
    },
    delFrien() {
      this.delFriendShow = false;
    },
    async removeFriend() {
      let ok = Snackbar["loading"]("正在删除中");
      await bot.removeFriend({
        qq: this.receiver_id,
      });
      ok.clear();
      ok = Snackbar["success"]("删除成功");
      setTimeout(() => {
        ok.clear();
      }, 2000);
      this.$route.back();
    },
    async openmenu() {
      let that = this;
      await ActionSheet({
        title: "选择一个操作",
        actions: this.menus,
        onSelect: (actions) => {
          console.log(actions.name);
          if (actions.name == "删除好友") {
            console.log("delFriendShow");
            that.delFriendShow = true;
          } else if (actions.name === "查看资料") {
            console.log("openUserInfo");
            this.openUserInfo();
          }
        },
      });
    },
    toBottom(data) {
      //console.log(this.$refs.myScrollbar)
      let el = document.getElementById("lumenChatPanel");
      let scrollHeight = data ? el.scrollHeight-data : el.scrollHeight;
      this.$refs.myScrollbar.setScrollTop(scrollHeight + 1000);
    },
    async sendMessage() {
      this.loadRecord.sending = 1;

      this.records.push({
        float: "right",
        name: "",
        avatar:
          "http://q2.qlogo.cn/headimg_dl?dst_uin=" + this.qq + "&spec=100",
        msg: this.value,
        time: new Date().getTime().toString(),
        type: "sending",
      });

      // let el = document.getElementById("lumenChatPanel");
      // el.scrollIntoView(false, {
      //   behavior: "smooth",
      //   block: "end",
      //   inline: "nearest",
      // });

      if (this.talk_type == 1) {
        await bot.sendMessage({
          friend: this.receiver_id,
          message: new Message().addText(this.value),
        });
      } else if (this.talk_type == 2) {
        await bot.sendMessage({
          group: this.receiver_id,
          message: new Message().addText(this.value),
        });
      }
      this.toBottom();
      this.value = "";
      this.loadRecord.sending = 0;
    },
    refresh() {
      let that = this;
      console.log("refresh message");
      if (that.loadRecord.status == 2) {
        that.loadRecord.status = 2;
        return;
      }
      that.loadRecord.status = 0;
      if (this.talk_type != 0) {
        let el = document.getElementById("lumenChatPanel");
        let scrollHeight = el.scrollHeight;
        getChatRecord({
          talk_type: this.talk_type,
          me: this.qq,
          receiver_id: this.receiver_id,
          page: this.page * 30,
        }).then(async (res) => {
          //let temp = that.records;
          if (res.data.length == 0) {
            that.loadRecord.status = 2;
          }
          for (let rr of res.data.reverse()) {
            let q = await that.messageParse(rr.messageChain, rr.msg);
            //console.log(rr);
            that.records.unshift({
              float: this.qq == rr.qq ? "right" : "left",
              name: rr.nickname,
              avatar:
                "http://q2.qlogo.cn/headimg_dl?dst_uin=" + rr.qq + "&spec=100",
              msg: q,
              time: rr.time,
              qq: rr.qq,
            });
            this.toBottom(scrollHeight);
          }

          //that.records = temp;
          that.loadRecord.status = 1;
          that.isRefresh = false;
          that.page++;

          // let scrollHeight = el.scrollHeight
          // if (that.records.length == 0) {
          //       el.scrollTop = el.scrollHeight
          //     } else {
          //       el.scrollTop = el.scrollHeight - scrollHeight
          //     }
        });
      }
    },
    initPlane() {},
    async messageParse(data, text) {
      let q = "";
      let result = [];
      try {
        result = JSON.parse(data);
      } catch (e) {
        console.log("messageParser json parse error .", e);
        return text;
      }
      if (result.length == 0) {
        return text;
      }

      for (let r of result) {
        if (r.type == "Plain") {
          q += r.text;
        }
        if (r.type == "Image") {
          q +=
            "<img loading='lazy' preview-src-list='['" +
            r.url +
            "']' style='width:40%;' class='messageImage' src='" +
            r.url +
            "'/>";
        }
        if (r.type == "Face") {
          q += "[" + r.name + "," + r.faceId + "]";
        }
        if (r.type == "At") {
          let user = await bot.getMemberInfo({
            group: this.receiver_id,
            qq: r.target,
          });
          q += "@" + user.memberName + " ";
        }
        if (r.type == "Voice") {
          q += "[voice" + r.voiceId + "]";
        }
      }
      return q;
    },
    getAvatar(talk_type, id) {
      if (talk_type == 1) {
        return "https://q2.qlogo.cn/headimg_dl?dst_uin=" + id + "&spec=100";
      } else if (talk_type == 2) {
        return "https://p.qlogo.cn/gh/" + id + "/" + id + "/100/";
      }
    },
    // 对话面板滚动事件
    orderScroll(e) {
      //console.log("pos", e.scrollTop);
      if (e.scrollTop == 0 && this.loadRecord.status == 1) {
        debounce(this.refresh, 2000, true)();

        console.log("top");
        return;
      }

      // const height = e.target.scrollTop + e.target.clientHeight + 5
      // this.tipsBoard = height < e.target.scrollHeight
      // if (this.tipsBoard == false && this.unreadMessage.num > 0) {
      //   this.$store.commit('CLEAR_TLAK_UNREAD_MESSAGE')
      // }
    },
  },
  deactivated() {
    // 在从 DOM 上移除、进入缓存
    // 以及组件卸载时调用
    console.log("chat deactivated");
    this.isOpenPlane = false;
  },
  activated() {
    // 在首次挂载
    // 以及每次从缓存中被重新插入的时候调用
    console.log("chat activated");
    this.isOpenPlane = true; //打开窗口状态为真
    this.records = [];
    this.loadRecord.status = 0;
    let that = this;
    if (that.loadRecord.status == 2) {
      that.loadRecord.status = 2;
      return;
    }
    that.loadRecord.status = 0;
    //获取聊天记录
    if (this.talk_type != 0) {
      getChatRecord({
        talk_type: this.talk_type,
        me: this.qq,
        receiver_id: this.receiver_id,
      }).then(async (res) => {
        //console.log(res)
        if (res.data.length == 0) {
          console.log("get message record was null")
          that.loadRecord.status = 2;
        }

        for (let rr of res.data) {
          let type = "text",
            q = "";
          q = await that.messageParse(rr.messageChain, rr.msg);
          that.records.push({
            float: this.qq == rr.qq ? "right" : "left",
            name: rr.nickname,
            avatar:
              "https://q2.qlogo.cn/headimg_dl?dst_uin=" + rr.qq + "&spec=100",
            msg: q,
            time: rr.time,
            type: type,
            qq: rr.qq,
          });
        }
        that.loadRecord.status = 1;
        this.$nextTick(() => {
          // let el = document.getElementById("lumenChatPanel");
          // el.scrollIntoView(false, {
          //   behavior: "smooth",
          //   block: "end",
          //   inline: "nearest",
          // });
          that.toBottom();
        });
        that.page++;

        // let scrollHeight = el.scrollHeight
        // if (that.records.length == 0) {
        //       el.scrollTop = el.scrollHeight
        //     } else {
        //       el.scrollTop = el.scrollHeight - scrollHeight
        //     }

        //处理菜单
        if (that.talk_type == 1) {
          that.menus = [
            {
              name: "查看资料",
              icon: "account-circle",
              color: "#00c48f",
            },
            {
              name: "发放授权",
              icon: "notebook",
              color: "#ff9800",
            },
            {
              name: "删除好友",
              icon: "delete",
              color: "#00afef",
            },
          ];
        } else {
          that.menus = [
            {
              name: "查看群资料",
              icon: "account-circle",
              color: "#00c48f",
            },
            {
              name: "设置群资料",
              icon: "notebook",
              color: "#ff9800",
            },
            {
              name: "退出群聊",
              icon: "delete",
              color: "#00afef",
            },
          ];
        }
      });
    }
  },
});
</script>

<style lang="less" scoped>
.userlogotop {
  width: 30px;
  height: 30px;
  // margin: 10px auto 0;
  margin-right: 8px;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: ease-in 3s;

  img {
    width: 100%;
    height: 100%;
  }

  &:hover {
    transform: rotate(360deg);
  }
}
.main-box {
  position: relative;
  padding-bottom: 0px;
}
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
}

.panel-aside {
  border-left: 1px solid #f5eeee;
}

/* 面板页脚 */
.footer-box {
  height: 160px !important;
  padding: 0;
  border-top: 1px solid #f5f5f5;
}

.tips-board {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  bottom: 20px;
  height: 30px;
  width: 100px;
  border-radius: 20px;
  font-size: 12px;
  background-color: #fff;
  box-shadow: 0 2.5px 10px 0 rgba(31, 35, 41, 0.1);
  color: #1f2329;

  span {
    margin-left: 5px;
    margin-top: -2px;
  }

  .svg {
    width: 10px;
    height: 10px;
    color: black;
  }
}

.talk-bubble {
  position: absolute;
  left: 0px;
  bottom: 20px;
  max-width: 300px;
  height: 40px;
  line-height: 40px;
  border-radius: 0 20px 20px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: white;
  padding: 0 15px 0 30px;
  font-size: 13px;
  background: #409eff;

  i {
    font-size: 22px;
    position: absolute;
    left: 5px;
    top: 9px;
  }
}

.talks-container {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 0px 30px;
  overflow-y: auto;

  .message-box {
    width: 100%;
    min-height: 30px;
    margin-bottom: 5px;
  }

  .loading-toolbar {
    height: 30px;
    line-height: 30px;
    margin: 5px 0;
    text-align: center;
    user-select: none;
    font-size: 13px;
    color: #cec4c4;

    .color-blue {
      color: #409eff;
    }
  }

  .datetime {
    height: 30px;
    line-height: 30px;
    color: #ccc9c9;
    font-size: 12px;
    text-align: center;
    margin: 5px 0;
  }

  .record-box {
    display: flex;
    flex-direction: row;
    transition: 0.5s ease;

    .checkbox-column {
      display: flex;
      justify-content: center;
      flex-basis: 40px;
      flex-shrink: 0;
      order: 1;
      user-select: none;
      padding-top: 25px;

      i {
        color: #ccc;
        cursor: pointer;
        font-size: 22px;
        &.selected {
          color: #409eff !important;
        }
      }
    }

    .avatar-column {
      width: 40px;
      flex-basis: 40px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      order: 2;
      user-select: none;
      padding-top: 22px;
      flex-direction: column;
    }

    .main-column {
      flex: 1 auto;
      order: 3;
      position: relative;
      box-sizing: border-box;
      padding: 5px;
      overflow: hidden;

      .talk-title {
        display: flex;
        align-items: center;
        height: 15px;
        margin-bottom: 2px;
        font-size: 10px;
        user-select: none;
        color: #a7a0a0;
        opacity: 0;
        transition: 0.5s ease;

        &.show {
          opacity: 1 !important;
        }

        span {
          transform: scale(0.9);
        }
      }

      .talk-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        box-sizing: border-box;
        width: 100%;

        .nickname {
          font-size: 12px;
          color: #a7a0a0;
          margin: -4px 0 4px -8px;
          transform: scale(0.9);
        }
      }

      &:hover {
        .talk-title {
          opacity: 1;
        }
      }
    }

    &.direction-rt {
      .avatar-column {
        order: 3;
      }

      .main-column {
        order: 2;

        .talk-title {
          justify-content: flex-end;
        }

        .talk-content {
          align-items: flex-end;
        }
      }
    }

    &.checkbox-border {
      border: 1px dashed #c4c4ec;
      &:hover {
        border-color: #409eff;
      }
    }
  }
}
.lum-scrollbar::-webkit-scrollbar {
  background-color: #ffffff;
}
.editor {
 width:95%;
}
.editor_outer {
  width: 100%;
  // border: thin solid #3a7afe;
  border-radius: 5px;
  padding: 5px 10px 0px 10px;
}
.messageImage {
  width: 30%;
}
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.mylogo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-left: 15px;
}
.el-image {
  border-radius: 50%;
}
</style>
