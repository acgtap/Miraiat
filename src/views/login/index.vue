<template>
<div id="login-box">
    <div class="header">快捷登录</div>
    <div class="main">
      <el-form ref="form" :model="form" :rules="rules">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="手机号"
            class="cuborder-radius"
            maxlength="11"
            
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            class="cuborder-radius"
           
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="submit-btn"
            :loading="loginLoading"
            @click="onSubmit('form')"
            >立即登录
          </el-button>
        </el-form-item>
        <el-form-item>
          <div class="links">
           
            <el-link
              type="primary"
              :underline="false"
              @click="toLink('/auth/register')"
              >不知道如何使用？查看教程
            </el-link>
          </div>
        </el-form-item>

        <p style="margin-top: 50px">
          <el-divider>
            <span style="color: rgb(181, 176, 176); font-weight: 200">
              <i class="el-icon-mobile-phone" /> 忘记账号？
            </span>
          </el-divider>
        </p>
        <el-form-item class="preview-account">
          <p>联系群主</p>
          <p>或者爱发电私聊</p>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref,defineComponent } from 'vue'
const input = ref('');
console.log(input)
export default defineComponent({
  name: 'ListPage',
  data() {
    return {
      loginLoading: false,
      form: {
        username: '',
        password: '',
      },
      rules: {
        username: [
          {
            required: true,
            message: '登录账号不能为空!',
            trigger: 'blur',
          },
        ],
        password: [
          {
            required: true,
            message: '登录密码不能为空!',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  components: {

  },
  setup() {
    console.log('ok')
  }
})
</script>
<style lang="less" scoped>
@import '../../assets/css/page/login-auth.less';
</style>