<template>
  <div>
    <var-pull-refresh v-model="refreshing" @refresh="refresh">
      <el-scrollbar
        tag="section"
        ref="menusScrollbar"
        class="full-height"
        :native="false"
      >
        <el-main class="main">
          <p v-show="loadStatus == 2" class="empty-data">
            <i class="el-icon-loading" /> 数据加载中...
          </p>

          <p v-show="loadStatus == 3 && talkNum == 0" class="empty-data">
            <!-- <var-result
            class="result"
            type="empty"
            title="空值"
            description="好像什么都没有~"
          >
          </var-result> -->
          </p>

          <p v-show="0" class="main-menu">
            <span class="title">消息记录 ({{ talkNum }})</span>
          </p>

          <!-- <p v-show="loadStatus == 4" style="text-align:center;">数据加载失败，请点击重试！</p> -->

        <!-- 对话列表 -->
        <template v-if="loadStatus == 3">
          <div
            v-for="item in chatList"
            :key="item.index_name"
            class="talk-item pointer"
            :class="{ active: index_name == item.index_name }"
            @click="clickTab(item.index_name)"
            @contextmenu.prevent="talkItemsMenu(item, $event)"
          >
            <div class="avatar-box">
              <span v-show="!item.avatar">
                {{ item.remark_name ? item.remark_name : item.name }}
              </span>
              <img
                v-show="item.avatar"
                :src="item.avatar"
                onerror="https://im.gzydong.club/public/media/image/avatar/20220819/44ec10a91e9a85bcaf2a9b7751b9559f_200x200.png"
              />
              <div
                v-show="item.is_top == 0"
                class="top-mask"
                @click.stop="topChatItem(item)"
              >
                <i class="el-icon-top" />
              </div>
            </div>
            <div class="card-box">
              <div class="title">
                <div class="card-name">
                  <p class="nickname">
                    {{ item.remark_name ? item.remark_name : item.name }}
                  </p>
                  <span v-show="item.unread" class="badge" data-v-480cb17d="" style="">{{item.unread}}条未读 </span>
                  <div v-show="item.is_top" class="larkc-tag top">TOP</div>

                    <div v-show="item.is_robot" class="badge top">BOT</div>

                    <div v-show="item.talk_type == 2" class="badge group">
                      群组
                    </div>
                    <div v-show="item.is_disturb" class="badge disturb">
                      <i class="iconfont icon-xiaoximiandarao" />
                    </div>
                  </div>
                  <div class="card-time">
                    <u-time :value="item.updated_at" />
                  </div>
                </div>
                <div class="content">
                  <template
                    v-if="index_name != item.index_name && item.draft_text"
                  >
                    <span class="draft-color">[草稿]</span>
                    <span>{{ item.draft_text }}</span>
                  </template>
                  <template v-else>
                    <template v-if="item.is_robot == 0">
                      <span
                        v-if="item.talk_type == 1"
                        :class="{ 'online-color': item.is_online == 1 }"
                      >
                        [{{ item.is_online == 1 ? "在线" : "离线" }}]
                      </span>
                      <span v-else>[群消息]</span>
                    </template>

                    <span>{{ item.msg_text }}</span>
                  </template>
                </div>
              </div>
            </div>
          </template>
        </el-main>
      </el-scrollbar>
    </var-pull-refresh>
  </div>
</template>
<script>
import UTime from "../message/utime.vue";
import { getList } from "../../api/all";
import { useListStore } from "../../store/List"
let List= useListStore();
import { mapWritableState } from 'pinia'

export default {
  name: "MessagePage",
  components: {
    UTime,
  },
  computed:{
    ...mapWritableState(useListStore, ['chatList'])
  },
  data() {
    return {
      loadStatus: 3,
      talkNum: 0,
      subHeaderShadow: false,
      launchGroupShow: false,

      // 对话面板的传递参数
      params: {
        talk_type: 0,
        receiver_id: 0,
        nickname: "",
      },

      // 查询关键词
      input: "",

      // header 工具菜单
      subMenu: false,

      // 消息未读数计时器
      interval: null,
      index_name: 0,
      refreshing: false, //是否正在刷新
    };
  },
  watch: {
    needReLoading: {
      handler(newQuestion, oldQuestion) {
        newQuestion;
        oldQuestion;
        let that = this;
        that.refresh()
      },
      deep: true,
    },
  },
  mounted() {
    this._getList();
  },
  methods: {
    refresh() {
      this._getList();
    },
    getAvatar(talk_type, id) {
      if (talk_type == 1) {
        return "https://q2.qlogo.cn/headimg_dl?dst_uin=" + id + "&spec=100";
      } else if (talk_type == 2) {
        return "https://p.qlogo.cn/gh/" + id + "/" + id + "/100/";
      }
    },
    clickTab(data) {
      this.PlaneInfo = {
        talk_type: this.chatList[data].talk_type,
        receiver_id:
          this.chatList[data].talk_type == 1
            ? this.chatList[data].qq
            : this.chatList[data].group,
        nickname: this.chatList[data].remark
          ? this.chatList[data].remark
            ? this.chatList[data].remark
            : "空名字"
          : this.chatList[data].name
          ? this.chatList[data].name
          : "空名字",
        index: data,
      };
      console.log(data);
      this.chatList[data].unread = 0;
      this.$router.push({
        name: "chat",
        params: {
          talk_type: this.chatList[data].talk_type,
          receiver_id:
            this.chatList[data].talk_type == 1
              ? this.chatList[data].qq
              : this.chatList[data].group,
          nickname: this.chatList[data].remark
            ? this.chatList[data].remark
              ? this.chatList[data].remark
              : "空名字"
            : this.chatList[data].name
            ? this.chatList[data].name
            : "空名字",
          index: data,
        },
      });
    },
    async _getList() {
      this.refreshing = true;
      let that = this;
      getList({
        id: List.qq,
      }).then((res) => {
        console.log(res);
        let temp = [];
        that.chatList=[];
        for (let rr of res.data) {
          temp.push({
            index_name: rr.id,
            talk_type: rr.talk_type,
            is_online: 1,
            draft_text: "",
            msg_text: rr.msg,
          });
          List.updateListApi({
            index_name: rr.id,
            talk_type: rr.talk_type,
            is_online: 1,
            draft_text: "",
            msg_text: rr.msg,
            is_robot: 0,
            is_top: 0,
            unread: 0,
            qq: rr.qq,
            group: rr.qq,
            updated_at: rr.time,
            remark_name: rr.nickname,
            name: rr.nickname,
            avatar: that.getAvatar(rr.talk_type, rr.qq),
          });
           List.pushList({
            index_name: rr.id,
            talk_type: 1,
            is_online: 1,
            draft_text: "",
            msg_text: rr.msg,
            is_robot: 0,
            is_top: 0,
            unread:0,
            updated_at: rr.time,
            remark_name: rr.nickname,
            name: rr.nickname,
            avatar:
              "http://q2.qlogo.cn/headimg_dl?dst_uin=" + rr.qq + "&spec=100",
          });
        }
        console.log(temp);
        that.talkNum = temp.length;
       
        this.refreshing = false;
      });
    },
  },
};
</script>
<style lang="less" scoped>
* {
  margin: 0;
  padding: 0;
}
.talk-item {
  padding: 8px 10px;
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-left: 3px solid transparent;
  transition: 0.2s ease-in;

  .avatar-box {
    height: 35px;
    width: 35px;
    flex-shrink: 0;
    background-color: #508afe;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    color: white;
    user-select: none;
    transition: ease 1s;
    position: relative;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      background-color: white;
      border-radius: 3px;
    }

    .top-mask {
      width: 100%;
      height: 100%;
      background-color: rgba(22, 25, 29, 0.6);
      position: absolute;
      top: 0;
      left: 0;
      color: white;
      display: none;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    &:hover .top-mask {
      display: flex;
    }
  }

  .card-box {
    height: 40px;
    display: flex;
    align-content: center;
    flex-direction: column;
    flex: 1 1;
    margin-left: 10px;
    overflow: hidden;

    .title {
      width: 100%;
      height: 20px;
      display: flex;
      align-items: center;

      .card-name {
        color: #1f2329;
        font-size: 14px;
        line-height: 20px;
        flex: 1 1;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        align-items: center;
        overflow: hidden;

        .nickname {
          font-weight: 400;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-right: 3px;
        }

        .top {
          color: #dc9b04 !important;
          background-color: #faf1d1 !important;
        }

        .group {
          color: #3370ff !important;
          background-color: #e1eaff !important;
          font-size: 13px;
        }

        .disturb {
          color: #98999c !important;
          background-color: #ecedf1 !important;
          i {
            font-size: 12px;
          }
        }
      }
    }

    .card-time {
      color: #8f959e;
      font-size: 12px;
      margin-left: 10px;
      user-select: none;
    }

    .content {
      font-size: 13px;
      line-height: 18px;
      color: #8f959e;
      margin-top: 3px;
      font-weight: 300;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      span:first-child {
        margin-right: 5px;
      }

      .online-color {
        color: #4aa71c;
        font-weight: 300;
      }

      .draft-color {
        color: red;
        font-weight: 300;
      }
    }
  }

  &:hover {
    background-color: #eff0f1;
  }

  &.active {
    .avatar-box {
      border-radius: 5px;
    }

    background-color: #eff0f1;
  }
}

@media screen and (max-width: 800px) {
  .aside-box {
    width: 220px !important;

    .subheader {
      display: none;
    }

    .card-box .larkc-tag {
      display: none;
    }
  }
}
.main {
  min-height: 200px;
}
.badge {
    font-size: 12px;
    font-weight: 400;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
    border-radius: 2px;
    cursor: default;
    user-select: none;
    background-color: #dee0e3;
    transform: scale(.83);
    transform-origin: left;
    flex-shrink: 0;
}

</style>
