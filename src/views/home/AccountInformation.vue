<template>
  <v-main>
    <v-card>
      <v-list dense>
        <v-list-item dense>
          <v-list-item-icon>
            <v-icon color="indigo">
              mdi-account
            </v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>用户编号</v-list-item-title>
            <v-list-item-subtitle>{{ getItem('userNumber') }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-dialog
                    v-model="updatePasswordDialog"
                    max-width="800px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                        color="error"
                        block
                        @click="updatePasswordDialog = true"
                >
                  修改密码
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class="headline">修改密码</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-form v-model="updatePasswordValid">
                      <v-row>
                        <v-col
                                cols="12"
                        >
                          <v-text-field
                                  type="password"
                                  v-model="oldPassword"
                                  label="登录密码"
                                  :rules="passwordRules"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col
                                cols="6"
                        >
                          <v-text-field
                                  type="password"
                                  v-model="newPassword"
                                  label="新密码"
                                  :rules="passwordRules"
                          ></v-text-field>
                        </v-col>
                        <v-col
                                cols="6"
                        >
                          <v-text-field
                                  type="password"
                                  v-model="confirmPassword"
                                  label="确认密码"
                                  :rules="[handleVerifyPassword]"
                          ></v-text-field>
                        </v-col>
                      </v-row>

                    </v-form>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                          color="blue darken-1"
                          text
                          @click="updatePasswordDialog = false"
                  >
                    取消
                  </v-btn>
                  <v-btn
                          color="blue darken-1"
                          text
                          @click="updatePassword"
                  >
                    确认
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-list-item-action>
        </v-list-item>

        <v-list-item dense>
          <v-list-item-action></v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>登录账号</v-list-item-title>
            <v-list-item-subtitle>{{ getItem('username') }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item dense v-if="getItem('roleName') === 'user'">
          <v-list-item-action></v-list-item-action>

          <v-list-item-content>
            <v-select
                    item-text="name"
                    item-value="userId"
                    v-model="superiorUserId"
                    :items="agentBriefInfoList"
                    label="选择区域代理商"
            ></v-select>
          </v-list-item-content>
        </v-list-item>
        <v-form dense v-model="informationValid" v-if="getItem('roleName') !== 'admin'">
         <v-list-item dense v-for="(item, index) in information"  :key="'i' + index">
          <v-list-item-icon>
            <v-icon color="indigo">
              {{ item.icon }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-text-field
                    :label="item.label"
                    :rules="item.rules"
                    v-model="item.value"
            ></v-text-field>
          </v-list-item-content>
        </v-list-item>
        </v-form>
        <v-list-item dense v-for="(item, index) in reservedInfoList"  :key="'r' + index">
          <v-list-item-icon>
            <v-icon color="indigo">
              {{ index ? '' : 'mdi-view-dashboard' }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-text-field
                    :label="'预留信息' + (index+1)"
                    v-model="reservedInfoList[index]"
            ></v-text-field>
          </v-list-item-content>
        </v-list-item>

        <v-list-item dense class="mt-n4">
          <v-list-item-action></v-list-item-action>

          <v-list-item-content>
            <v-row>
              <v-col
                      v-if="getItem('roleName') !== 'admin'"
                      cols="6"
                >
                <v-btn
                        color="info"
                        block
                        @click="addReservedInformation"
                >
                  新增预留信息
                </v-btn>
              </v-col>
              <v-col
                      v-if="getItem('roleName') !== 'admin'"
                      cols="6"
              >
                <v-btn
                        block
                        color="success"
                        @click="updateUserInfo"
                >
                  修改信息
                </v-btn>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
    <v-snackbar
            v-model="snackbar"
    >
      {{ snackbarHint }}

      <template v-slot:action="{ attrs }">
        <v-btn
                color="blue"
                text
                v-bind="attrs"
                @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-main>
</template>

<script>
  export default {
    name: "AccountInformation",
    data() {
      return {
        snackbar: false,
        snackbarHint: '',
        superiorUserId: Number(this.getItem('superiorUserId')),
        agentBriefInfoList: [],
        informationValid: false,
        updatePasswordValid: false,
        updatePasswordDialog: false,
        oldPassword: '',
        confirmPassword: '',
        newPassword: '',
        passwordRules: [
          value => (value && value.length >= 5 && value.length <= 12) || '字符长度为 5~12',
          value => !(/[^a-zA-Z0-9]/.exec(value)) || '需使用数字、英文，不能使用特殊符号'
        ],
        information: [
          {
          label: '客户名称', icon: 'mdi-account-box', key:'name', value: this.getItem('name') || '', rules: [
            value => !!value || '必填',
            value => (value && value.length >= 3) || '最小长度为3',]
          },
          {
            label: '联系人', icon: 'mdi-account-details', key:'contactPerson', value:  this.getItem('contactPerson') || '', rules: [
              value => !!value || '必填',
              value => (value && value.length >= 3) || '最小长度为3',]
          },
          {
            label: '联系电话', icon: 'mdi-cellphone', key:'contactInfo', value: this.getItem('contactInfo') || '', rules: [
              value => !!value || '必填',
              value => (value && /^1[3456789]\d{9}$/.test(value)) || '请输入正确的电话号码',]
          },
          {
            label: '地址', icon: 'mdi-map-marker', key:'address', value: this.getItem('address') || '', rules: [
              value => !!value || '必填',
              value => (value && value.length >= 3) || '最小长度为3',]
          },
          {
            label: '备注', icon: 'mdi-view-dashboard', key:'message', value: this.getItem('message') || '', rules: []
          }
        ],
        reservedInfoList: this.$store.state.reservedInfoList
      }
    },
    created() {
      if (this.getItem('roleName') === 'user') {
        this.getAgentBriefInfoList()
      }
    },
    methods: {
      async updateUserInfo() {
        if (!this.informationValid) {
          return
        }
        console.log('okok')
        const form = {}
        const userInfo = ['userId', 'userNumber', 'username']
        for (let item of this.information) {
          form[item.key] = item.value
        }
        for (let item of userInfo) {
          form[item] = this.getItem(item)
        }
        if (this.getItem('roleName') === 'user') {
          form.superiorUserId = this.superiorUserId
        }
        // 预留信息
        form.reservedInfoList = this.reservedInfoList
        const { data: {data, code, message}} = await this.$axios.post('/user/updateUserInfo', form)
        this.showSnackbar(message)
      },
      async getAgentBriefInfoList() {
        const { data: { data }} = await this.$axios.get('/user/findRegionalAgentBriefInfo')
        this.agentBriefInfoList = data
        console.log('agent', this.agentBriefInfoList)
      },
      addReservedInformation() {
        if ( this.reservedInfoList.length < 8) {
          this.reservedInfoList.push('')
        }
      },

      showSnackbar(message) {
        this.snackbar = true
        this.snackbarHint = message
      },
      async updatePassword() {
        if (!this.updatePasswordValid) {
          return
        }
        const userId = this.getItem('userId')
        const oldPassword = this.oldPassword
        const newPassword = this.newPassword
        const confirmPassword = this.confirmPassword
        const { data: {code, message}} = await this.$axios.post('/user/updatePassword', {
          userId,
          oldPassword,
          confirmPassword,
          newPassword,
        })
        if (!code) {
          this.showSnackbar('更改密码成功')
          this.updatePasswordDialog = false
          setTimeout(() => {
            window.sessionStorage.clear()
            this.$router.push('/login')
          }, 1500)
        } else {
          this.showSnackbar(message)
        }
      },
      handleVerifyPassword(value) {
        if (value && value === this.newPassword) {
          return true
        } else {
          return '密码不一致'
        }
      }
    }
  }
</script>

<style scoped>

</style>
