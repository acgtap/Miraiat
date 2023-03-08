<script>
import { bot } from "../../core/mirai";
import { useListStore } from "../../store/List";
let List = useListStore();
export default {
  name: "friend",
  data() {
    return {
      // 用于点击当前页的router时，刷新当前页
      showView: true,
      loading: true,
      finished: false,
      List: [],
      perpage: 40,
      page: 0,
      friendList: [],
      first:true,
    };
  },
  mounted(){
    this.getFriendList();
    this.first=false
  },
  activated() {
    if(!this.first){
    this.getFriendList();
    }
    console.log('friend activated')

  },
  deactivated() {
    this.friendList = [];
    this.page=0;
  },
  methods: {
    openChat(id, name) {
      console.log("openChat", id, name);
      this.$router.push({
        name: "chat",
        params: {
          talk_type: 1,
          receiver_id: id,
          nickname: name ? name : "空名字",
          index: 0,
        },
      });
    },
    async getFriendList() {
      let friend = await bot.getFriendList();
      List.updateFriendNum(friend.length);
      for (let rr of friend) {
        this.friendList.push(rr);
      }
      //console.log(this.friendList)
      this.load();
    },
    // 刷新当前路由方法
    load() {
      this.loading = true;
      if (this.friendList.length == 0) {
        this.finished = true;
      } else {
        this.finished = false;
      }
      this.List = this.List.concat(this.friendList.splice(0, this.perpage));
      this.loading = false;

      if (this.List.length == 0) {
        return;
      }
      this.page++;
    },
  },
};
</script>

<template>
  <var-list
    class="frilist"
    :finished="finished"
    v-model:loading="loading"
    @load="load"
  >
    <var-cell
      class=""
      :key="item"
      border
      v-for="item in List"
      @click="openChat(item.id, item.name)"
    >
      <div class="fricell">
        <el-image
          class="lazy-logo"
          loading="lazy"
          :src="
            'http://q2.qlogo.cn/headimg_dl?dst_uin=' + item.id + '&spec=100'
          "
        />
        <div class="fri">{{ item.name }} ({{ item.remark }})</div>
      </div>
    </var-cell>
  </var-list>
</template>
<style scoped>
.lazy-logo {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
.fricell {
  display: inline-flex;
}
.fri {
  line-height: 30px;
  margin-left: 10px;
}
.frilist {
  margin-bottom: 50px;
}
</style>
