
<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
        <!-- 主界面最外层 -->
        <template v-if="Component">
        <transition :name="switchTransition">
          <keep-alive>
            <component :is="Component" :key="route.fullpath"></component>
          </keep-alive>
        </transition>
      </template>
    </router-view>
  </div>
</template>
<script>
export default {
  name: "App",
  data() {
    return {
      // 用于点击刷新当前页
      showViews: true,
      switchTransition:'one'
    };
  },
  methods: {
    // 刷新当前页面方法
    refreshView() {
      this.showViews=true
    },
  },
  watch:{
    $route(to,from){
      const isBack = this.$router.isBack;
      if (from.meta.leavel && to.meta.leavel) {
        this.switchTransition = "one";
      } else if (!to.meta.leavel) {
        this.switchTransition = "twofade";
      }
      if (isBack) {
        this.switchTransition = "threefade";
      }
      this.$router.isBack = false; 
    }
  }
};
</script>
<style scoped>
* {
  margin: 0;
  padding: 0;
}
body {
  margin: 0px;
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.one-enter {
  opacity: 0;
}
.one-enter-active,
.one-leave-active {
  transition: all 0;
}
.onefade-leave-to {
  opacity: 0;
}


.twofade-enter {transform: translateX(100%);}
.twofade-enter-active {transition: all 0.3s;position: absolute;height:100%;background:#ececec;}
.twofade-leave-active {transition: all 0;transition-delay: 0.3s;position: absolute;}
.twofade-leave-to {transform: translateX(-100%);}
.threefade-enter {transform: translateX(-100%);}
.threefade-leave-to {transform: translateX(100%);} 
.threefade-enter-active {transition: all 0s;position: absolute;z-index: 2;}
.threefade-leave-active {transition: all .3s;position: absolute;z-index: 999;height: 100%;background:#ececec;}


</style>
