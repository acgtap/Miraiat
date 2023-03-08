<template>
  <div>
    <var-app-bar :title="setting.title" :color="setting.backgroundColor">
      <template #right>
        <var-image
          width="30px"
          height="30px"
          fit="cover"
          radius="50%"
          :src="'http://q2.qlogo.cn/headimg_dl?dst_uin=' + qq + '&spec=100'"
          @click="openMenu"
        />
      </template>
    </var-app-bar>

    <var-tabs-items
      :style="'background: url(' + setting.background + ') top center fixed;'"
      v-model:active="active"
    >
      <var-tab-item>
        <keep-alive
          ><div class="scorll" :style="'height:' + viewHeight + ';'">
            <List></List></div
        ></keep-alive>
      </var-tab-item>
      <var-tab-item>
        <div class="scorll" :style="'height:' + viewHeight + ';'">
          <var-index-bar duration="300" :color="setting.backgroundColor">
            <var-tabs v-model:active="friendActive" :active-color="setting.backgroundColor">
              <var-tab
                >好友<small v-if="nums.friend != 0"
                  >{{ nums.friend }}个</small
                ></var-tab
              >
              <var-tab
                >群组<small v-if="nums.group != 0"
                  >{{ nums.group }}个</small
                ></var-tab
              >
            </var-tabs>

            <var-tabs-items v-model:active="friendActive">
              <var-tab-item>
                <Friend></Friend>
              </var-tab-item>
              <var-tab-item>
                <Group></Group>
              </var-tab-item>
            </var-tabs-items>
          </var-index-bar>
        </div>
      </var-tab-item>
      <var-tab-item>
        <div class="scorll" :style="'height:' + viewHeight + ';'">
          <Setting></Setting>
        </div>
      </var-tab-item>
    </var-tabs-items>

    <var-bottom-navigation :active-color="setting.backgroundColor" v-model:active="active" class="footer">
      <var-bottom-navigation-item label="首页" icon="home" />
      <var-bottom-navigation-item label="朋友" icon="magnify" />
      <var-bottom-navigation-item label="设置" icon="heart" />
    </var-bottom-navigation>
    <var-action-sheet
      :actions="actions"
      v-model:show="show"
      @select="openTopMenu"
      ><template #title>
        <var-row>
          <var-col :span="5"
            ><img
              class="mylogo"
              :src="
                'http://q2.qlogo.cn/headimg_dl?dst_uin=' + qq + '&spec=100'
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
import { ref ,defineComponent } from 'vue'
import Friend from '../friend/index';
import List from '../message/list-item';
import {initSocket} from '../../core/mirai'
import { storeToRefs } from 'pinia'
import {useListStore} from "../../store/List"
let Store = useListStore();
let { qq } = storeToRefs(Store);
qq;
//const active = ref('选项1')
const list = ref([]);

export default defineComponent({
  name: "indexHome",
  components: {
    Friend,
    List,
    Group,
    Setting,
  },
  computed: {
    ...mapWritableState(useListStore, ["nums", "qqList", "qq", "setting"]),
  },
  data() {
    return {
      active: 0,
      friendActive: 0,
      actions: [
        {
          name: "我的资料",
          icon: "account-circle",
          color: "#00c48f",
        },
        {
          name: "切换账号",
          icon: "notebook",
          color: "#ff9800",
        },
        {
          name: "退出登录",
          icon: "wifi",
          color: "#00afef",
        },
      ],
      show: false,
      user: {},
      viewHeight: 0,
    };
  },
  beforeMount() {
    //初始化设置
    Store.getConfigFromLocal();
  },
  mounted() {
    document.title = this.setting.title;
    this.viewHeight = window.innerHeight - 54 - 50 + "px";
    console.log(this.viewHeight);
    console.log("home mounted");
    initSocket();

    for (let i = 0; i < 26; i++) {
      list.value.push(String.fromCharCode(65 + i));
    }
  },
  methods: {
    async openMenu() {
      let userinfo = "";
      try {
        userinfo = await bot.getUserProfile({ qq: this.qq });
      } catch (err) {
        console.log(err);
      }
      console.log(userinfo);
      this.user = userinfo;
      this.show = true;
    },
    async openTopMenu(actions) {
      let that = this;
      console.log(actions.name);
      if (actions.name == "切换账号") {
        console.log("changeAccu");
        let qqmenu = [];
        qqmenu.push({ name: "添加账号", icon: "plus" });
        this.qqList.forEach((element) => {
          qqmenu.push({
            name: element,
            icon:
              "https://q2.qlogo.cn/headimg_dl?dst_uin=" + element + "&spec=100",
          });
        });

        await ActionSheet({
          title: "选择一个账号",
          actions: qqmenu,
          onSelect: (actions) => {
            console.log(actions.name);
            if (actions.name == "添加账号") {
              console.log("添加账号");
            } else {
              let load = Snackbar.loading("切换中");
              Store.qq = actions.name;
              Store.chatList = [];
              Store.needReLoading.push(new Date().toString());
              load.clear();
              initSocket();
              Snackbar.success("切换账号成功");
            }
            that;
          },
        });
      }
    },
  },

  activated() {
    // 在首次挂载、
    // 以及每次从缓存中被重新插入的时候调用
    console.log("home activated");
  },
  deactivated() {
    // 在从 DOM 上移除、进入缓存
    // 以及组件卸载时调用
    console.log("home deactivated");
  },
  unmounted() {
    console.log("home unmounted");
  },
});
</script>
<style scoped>
* {
  margin: 0;
  padding: 0;
}
.footer {
  position: fixed;
  left: 0px;
  bottom: 0px;
}
.mylogo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-left: 15px;
}
.scorll {
  height: 500px;
  overflow: scroll;
}
</style>
