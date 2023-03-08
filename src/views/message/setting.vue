<script>
import { useListStore } from "../../store/List";
import { mapWritableState } from "pinia";
import { bot, initSocket } from "../../core/mirai";
import { ActionSheet, Snackbar } from "@varlet/ui";
export default {
  computed: {
    ...mapWritableState(useListStore, [
      "nums",
      "qqList",
      "chatList",
      "qq",
      "setting",
      "needReLoading",
    ]),
  },
  data() {
    return {
      value: "",
      user: [],
      showAddAcc: false,
      backgroundImage: "",
    };
  },
  mounted() {
    this.loadUser();
  },
  methods: {
    changeColor(e) {
      this.setting.backgroundColor = e;
      localStorage.setItem("backgroundColor", e);

    },
    applyBackground() {
      //应用背景
      this.setting.background = this.backgroundImage;
      localStorage.setItem("background", this.backgroundImage);
    },
    async loadUser() {
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
    async changeAcc() {
      console.log("changeAccu");
      let that = this;
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
            that.showAddAcc = true;
          } else {
            let load = Snackbar.loading("切换中");
            this.qq = actions.name;
            this.chatList = [];
            this.needReLoading.push(new Date().toString());
            load.clear();
            initSocket();
            Snackbar.success("切换账号成功");
          }
        },
      });
    },
  },
};
</script>

<template>
  <div class="container" style="padding-left: 10px; padding-right: 10px">
    <var-card :title="user.nickname" :description="user.sign" class="cardTop">
      <template #extra>
        <var-space justify="center">
          <var-image
            width="50px"
            height="50px"
            fit="cover"
            radius="50%"
            style="border"
            :src="'http://q2.qlogo.cn/headimg_dl?dst_uin=' + qq + '&spec=100'"
          />
        </var-space>
      </template>
    </var-card>
    <var-card class="cardTop">
      <template #extra>
        <var-cell icon="account-circle" title="切换添加账号" @click="changeAcc">
        </var-cell>
      </template>
    </var-card>
    <var-card class="cardTop" :elevation="2">
      <template #extra>
        <var-cell icon="fire" title="更改主题色"> </var-cell>
        <var-cell>
          <var-space justify="center">
            <var-button
              color="#66bb6a"
              text-color="#fff"
              @click="changeColor('#66bb6a')"
              >绿色</var-button
            >
            <var-button
              color="linear-gradient(to right, #69dbaa, #3a7afe)"
              text-color="#fff"
              @click="
                changeColor('linear-gradient(to right, #69dbaa, #3a7afe)')
              "
              >渐变色</var-button
            >
            <var-button
              color="#E6A23C"
              text-color="#fff"
              @click="changeColor('#E6A23C')"
              >橙色</var-button
            >
          </var-space>
        </var-cell>
      </template>
    </var-card>
    <!-- <var-card
      class="cardTop"
      outline
      :elevation="0"
      title="本草纲目"
      subtitle="我表情悠哉 跳个大概"
      description="如果华佗再世,崇洋都被医治,外邦来学汉字,激发我民族意识。马钱子、决明子、苍耳子，还有莲子；黄药子、苦豆子、川楝子，我要面子。用我的方式，改写一部历史。没什么别的事，跟着我念几个字。山药当归枸杞 GO，山药 当归 枸杞 GO，看我抓一把中药，服下一帖骄傲~"
    /> -->

    <var-card class="cardTop">
      <template #extra>
        <var-cell icon="heart" title="背景图片">
          <var-input
            placeholder="请输入背景图片资源地址"
            v-model="backgroundImage"
          />
          <var-button
            :color="setting.backgroundColor"
            text-color="#fff"
            @click="applyBackground"
            >应用</var-button
          >
        </var-cell>
      </template>
    </var-card>

    <var-card class="cardTop">
      <template #extra>
        <var-cell icon="star" title="服务器信息"> </var-cell>
      </template>
    </var-card>

    <var-dialog v-model:show="showAddAcc">
      <template #title>
        <var-icon name="information" color="#2979ff" />添加账号
      </template>
      <var-input
        placeholder="请输入一个已经在服务器中存在的ID号"
        v-model="value"
      />
    </var-dialog>
  </div>
</template>
<style>
.container {
  padding-left: 10px;
  padding-right: 10px;
}
.cardTop {
  margin-top: 10px;
  opacity: 0.75;
}
</style>
