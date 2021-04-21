// 登录模块
<template>
  <v-main>
    <v-card
      class="mx-auto"
      elevation="5"
      width="400"
      :class="loginClass"
      @keydown.enter="handleLogin"
    >
      <v-tabs v-model="tab" fixed-tabs color="deep-purple accent-4" centered>
        <v-tab>登录</v-tab>
        <v-tab>设备数据搜索</v-tab>
        <v-tabs-items v-model="tab">
          <v-tab-item>
              <v-card>
                <v-card-title> 上腾科技云平台 </v-card-title>
                <v-card-text>
                  <v-form v-model="valid">
                    <v-text-field
                      autofocus
                      v-model="username"
                      label="账号"
                      :rules="usernameRules"
                      hide-details="auto"
                    ></v-text-field>
                    <v-text-field
                      type="password"
                      v-model="password"
                      label="密码"
                      :rules="passwordRules"
                    ></v-text-field>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-btn v-if="!isFail" color="info" block @click="handleLogin">
                    登录
                 </v-btn>
                  <v-btn v-else color="error" block>
                    {{ loginMessage }}
                  </v-btn>
                </v-card-actions>
              </v-card>
          </v-tab-item>
            <v-tab-item>
              <v-card>
                <v-card-text>
                  <v-form v-model="valid" >
                    <v-text-field
                      autofocus
                      v-model="deviceId"
                      label="设备Id"
                      @keydown="searchDeviceDataByKey"
                      :rules="deviceIdRule"
                      hide-details="auto"
                    ></v-text-field>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-btn v-if="!isFailById" color="info" block @click="searchDeviceData">
                    搜索
                 </v-btn>
                  <v-btn v-else color="error" block>
                    {{ searchMessage }}
                  </v-btn>
                </v-card-actions>
              </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-tabs>
    </v-card>
    <v-footer
      fixed
      inset
      style="z-index: 100"
      color="rgba(255, 0, 0, 0.01)"
      height="40px"
      class="justify-center"
    >
      <a
        href="https://beian.miit.gov.cn"
        class="grey--text text--lighten-5 text-decoration-none text-caption"
        >粤ICP备2020091671号</a
      >
    </v-footer>
  </v-main>
</template>

<script>
export default {
  name: "Login",
  data: () => ({
    isFail: false,
    isFailById: false,
    valid: false,
    loginMessage: "服务器错误",
    searchMessage: "Id格式有误",
    username: "",
    password: "",
    deviceId: "",
    // pn: 1,
    usernameRules: [
      (value) =>
        (value && value.length >= 1 && value.length <= 24) || "字符长度为 1~24",
      (value) =>
        !/[^a-zA-Z0-9]/.exec(value) || "需使用数字、英文，不能使用特殊符号",
    ],
    passwordRules: [
      (value) =>
        (value && value.length >= 5 && value.length <= 12) || "字符长度为 5~12",
      (value) =>
        !/[^a-zA-Z0-9]/.exec(value) || "需使用数字、英文，不能使用特殊符号",
    ],
    deviceIdRule: [
      (value) =>
        (value && value.length >= 1 && value.length <= 10) || "字符长度为 1~12",
      (value) =>
        !/[^0-9]/.exec(value) || "需使用数字，不能使用英文、文字及特殊符号",
    ],
    tab: null,
  }),
  computed: {
    loginClass() {
      return this.isFail || this.isFailById ? ["wobble-hor-bottom"] : []
    },
  },
  methods: {
    handleLogin() {
      if (!this.valid) {
        !this.isFail && (this.isFail = true);
        this.loginMessage = "输入格式有误";
        setTimeout(() => {
          this.isFail && (this.isFail = false);
        }, 800);
        return;
      }
      // 登录请求
      this.$axios
        .post("/login", {
          username: this.username,
          password: this.password,
        })
        .then(
          ({ headers: { authorization }, data: { code, data, message } }) => {
            // console.log("code", code);
            // console.log("data", data);
            // console.log("message", message);
            // console.log("authorization", authorization);
            if (!code) {
              const {
                role,
                superiorUser,
                user: {
                  name,
                  userId,
                  userNumber,
                  username,
                  contactInfo,
                  contactPerson,
                  address,
                  reservedInfoList,
                  message,
                },
              } = data;
              // 将登录信息存储
              this.saveItem("name", name)
                .saveItem("userId", userId)
                .saveItem("userNumber", userNumber)
                .saveItem("username", username)
                .saveItem("contactInfo", contactInfo)
                .saveItem("contactPerson", contactPerson)
                .saveItem("address", address)
                .saveItem("message", message)
                .saveItem("token", authorization)
                .saveItem("reservedInfoList", JSON.stringify(reservedInfoList));
              this.$store.commit("setReservedInfoList", reservedInfoList);
              if (superiorUser) {
                this.saveItem("superiorUserId", superiorUser.userId).saveItem(
                  "superiorUserName",
                  superiorUser.name
                );
              }
              if (role) {
                this.saveItem("roleName", role.roleName).saveItem(
                  "roleId",
                  role.roleId
                );
              }

              this.$router.replace("/");
            } else {
              this.loginMessage = message;
              !this.isFail && (this.isFail = true);
            }
          }
        )
        .catch((error) => {
          this.loginMessage = "服务器错误";
          !this.isFail && (this.isFail = true);
          console.log("error", error);
        })
        .finally(() => {
          setTimeout(() => {
            this.isFail && (this.isFail = false);
          }, 800);
        });
    },
    async searchDeviceData() {
      if (!this.valid) {
        !this.isFailById && (this.isFailById = true);
        this.searchMessage = "Id格式有误";
        setTimeout(() => {
          this.isFailById && (this.isFailById = false);
        }, 800);
        return;
      }
      const { data: { code, message}} = await this.$axios
        .get("/deviceData/findDeviceDataByDeviceId",{ params: {
          deviceId: this.deviceId,
          pn: 1,
          resultJudgment:'ALL',
          testMode: 'ALL',
          testedBarCode: ''
        }})
        if(code === 10035){
          this.searchMessage = message
          this.isFailById = true
          return
        }
        if(!code){
          this.isFailById = false
          this.saveItem("deviceId", this.deviceId)
          this.$router.replace("/deviceDataList");
        }
    },
    searchDeviceDataByKey(e){
      console.log(e);
      if(e.keyCode === 13){
        this.searchDeviceData()
      }
    }
  },
};
</script>

<style scoped>
main {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url("../assets/images/loginBG.png");
  background-size: cover;
}
/* ----------------------------------------------
 * Generated by Animista on 2020-11-20 11:6:31
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info.
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

/**
  * ----------------------------------------
  * animation wobble-hor-bottom
  * ----------------------------------------
  */
@-webkit-keyframes wobble-hor-bottom {
  0%,
  100% {
    -webkit-transform: translateX(0%);
    transform: translateX(0%);
    -webkit-transform-origin: 50% 50%;
    transform-origin: 50% 50%;
  }
  15% {
    -webkit-transform: translateX(-30px) rotate(-6deg);
    transform: translateX(-30px) rotate(-6deg);
  }
  30% {
    -webkit-transform: translateX(15px) rotate(6deg);
    transform: translateX(15px) rotate(6deg);
  }
  45% {
    -webkit-transform: translateX(-15px) rotate(-3.6deg);
    transform: translateX(-15px) rotate(-3.6deg);
  }
  60% {
    -webkit-transform: translateX(9px) rotate(2.4deg);
    transform: translateX(9px) rotate(2.4deg);
  }
  75% {
    -webkit-transform: translateX(-6px) rotate(-1.2deg);
    transform: translateX(-6px) rotate(-1.2deg);
  }
}
@keyframes wobble-hor-bottom {
  0%,
  100% {
    -webkit-transform: translateX(0%);
    transform: translateX(0%);
    -webkit-transform-origin: 50% 50%;
    transform-origin: 50% 50%;
  }
  15% {
    -webkit-transform: translateX(-30px) rotate(-6deg);
    transform: translateX(-30px) rotate(-6deg);
  }
  30% {
    -webkit-transform: translateX(15px) rotate(6deg);
    transform: translateX(15px) rotate(6deg);
  }
  45% {
    -webkit-transform: translateX(-15px) rotate(-3.6deg);
    transform: translateX(-15px) rotate(-3.6deg);
  }
  60% {
    -webkit-transform: translateX(9px) rotate(2.4deg);
    transform: translateX(9px) rotate(2.4deg);
  }
  75% {
    -webkit-transform: translateX(-6px) rotate(-1.2deg);
    transform: translateX(-6px) rotate(-1.2deg);
  }
}

.wobble-hor-bottom {
  -webkit-animation: wobble-hor-bottom 0.8s both;
  animation: wobble-hor-bottom 0.8s both;
}
</style>
