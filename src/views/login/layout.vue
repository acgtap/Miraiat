<template>
  <div>
    <el-container id="auth-container">
      <el-main>
        <div id="logo-name" class="animated slideInLeft">
          Mirai For Nicole
        </div>
        
        <router-view />

        <div class="copyright" v-html="2022"></div>
      </el-main>
    </el-container>

    <div class="fly-box">
      <div class="fly bg-fly-circle1"></div>
      <div class="fly bg-fly-circle2"></div>
      <div class="fly bg-fly-circle3"></div>
      <div class="fly bg-fly-circle4"></div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {}
  },
}
</script>
<style lang="less" scoped>
@import '../../assets/css/page/login-auth.less';
</style>
