<template>
  <v-dialog
          v-model="addUserDialog"
          max-width="800px"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
              color="primary"
              dark
              class="mb-2"
              width="200px"
              medium
              v-bind="attrs"
              v-on="on"
      >
        新增代理商
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">新增代理商</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-form v-model="valid">
            <v-row>
              <v-col
                      cols="12"
                      sm="6"
                      md="4"
              >
                <v-text-field
                        v-model="addUserItem.userNumber"
                        label="用户编号"
                        :rules="rules.userNumber"
                        @blur="checkUserNumber"
                ></v-text-field>
              </v-col>
              <v-col
                      cols="12"
                      sm="6"
                      md="4"
              >
                <v-text-field
                        v-model="addUserItem.username"
                        label="登录账号"
                        :rules="rules.username"
                ></v-text-field>
              </v-col>
              <v-col
                      cols="12"
                      sm="6"
                      md="4"
              >
                <v-text-field
                        v-model="addUserItem.password"
                        label="登录密码"
                        :rules="rules.password"
                ></v-text-field>
              </v-col>
              <v-col
                      cols="12"
                      sm="6"
                      md="4"
              >
                <v-text-field
                        v-model="addUserItem.confirmPassword"
                        label="确认密码"
                        :rules="[handleVerifyPassword]"
                ></v-text-field>
              </v-col>
              <v-col
                      cols="12"
                      sm="6"
                      md="4"
              >
                <v-text-field
                        v-model="addUserItem.name"
                        label="客户名称"
                        :rules="rules.name"
                ></v-text-field>
              </v-col>
              <v-col
                      cols="12"
                      sm="6"
                      md="4"
              >
                <v-text-field
                        v-model="addUserItem.contactPerson"
                        label="联系人"
                        :rules="rules.contactPerson"
                ></v-text-field>
              </v-col>
              <v-col
                      cols="12"
                      sm="6"
                      md="4"
              >
                <v-text-field
                        v-model="addUserItem.contactInfo"
                        label="联系电话"
                        :rules="rules.contactInfo"
                ></v-text-field>
              </v-col>
              <v-col
                      cols="12"
                      sm="6"
                      md="4"
              >
                <v-text-field
                        v-model="addUserItem.address"
                        label="地址"
                        :rules="rules.address"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col
                      cols="24"
              >
                <v-text-field
                        v-model="addUserItem.message"
                        label="备注"
                        :rules="rules.message"
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
                @click="closeAddUserDialog"
        >
          取消
        </v-btn>
        <v-btn
                color="blue darken-1"
                text
                @click="handleAddUser"
        >
          确认
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    name: "userListDialog",
    data: () => ({
      roleList: [],
      agentBriefInfoList: [],
      addUserDialog: false,
      // 添加用户 - 表单是否验证
      valid: false,
      // 检查usernumber是否唯一
      isOnly:false,
      // 添加用户数据格式
      addUserItem: {
        roleId: 3,
        userNumber: '',
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        contactPerson: '',
        contactInfo: '',
        address: '',
        // 旗上区域代理商的id
        superiorUserId: '',
        message: ''
      },
      rules: {
        roleId: [
          value => !!value || '必选',
        ],
        userNumber: [
          value => (value && value.length >= 1 && value.length <= 32) || '字符长度为 1~32',
          value => !(/[^a-zA-Z0-9_]/.exec(value)) || '可使用数字、英文、下划线，不能包括特殊符号'
        ],
        username: [
          value => (value && value.length >= 1 && value.length <= 24) || '字符长度为 1~24',
          value => !(/[^a-zA-Z0-9]/.exec(value)) || '需使用数字、英文，不能使用特殊符号'
        ],
        password: [
          value => (value && value.length >= 6 && value.length <= 12) || '字符长度为 6~12',
          value => !(/[^a-zA-Z0-9]/.exec(value)) || '需使用数字、英文，不能使用特殊符号'
        ],
        confirmPassword: [
          value => (value && value === this.addUserItem.password) || '密码不一致',
        ],
        name: [
          value => (value && value.length >= 1 && value.length <= 32) || '字符长度为 1~32',
        ],
        contactPerson: [
          value => (value && value.length >= 1 && value.length <= 32) || '字符长度为 1~32',
        ],
        contactInfo: [
          value => (value && value.length >= 1 && value.length <= 24) || '字符长度为 1~24',
          value => (/^(((\+\d{2}-)?0\d{2,3}-\d{7,8})|((\+\d{2}-)?(\d{2,3}-)?([1][0-9][0-9]\d{8})))$/.exec(value)) || '请输入正确的电话号码'
        ],
        address: [
          value => (value.length <= 128) || '字符长度为 0~128',
        ],
        message: [
          value => (value.length <= 128) || '字符长度为 0~128',
        ]
      },
    }),
    props:['total'],
    watch: {
      addUserDialog(val) {
        if (val) {
        } else {
          this.closeAddUserDialog()
        }
      },
    },
    methods: {
      handleVerifyPassword(value) {
        if (value && value === this.addUserItem.password) {
          return true
        } else {
          return '密码不一致'
        }
      },
      // async getRoleList() {
      //   const { data: { data }} = await this.$axios.get('/role/findRole')
      //   this.roleList = data
      // },
      // async getAgentBriefInfoList() {
      //   const { data: { data }} = await this.$axios.get('/user/findRegionalAgentBriefInfo')
      //   this.agentBriefInfoList = data
      //   console.log('agent', this.agentBriefInfoList)
      // },
      // Dialog 控制层
      closeAddUserDialog () {
        this.addUserDialog = false
        },
          async handleAddUser() {
          if (!this.valid) {
            this.$emit('showSnackbar', '请正确填写信息')
            return
          }
        const { data: { code, message }} = await this.$axios.get('/user/checkUser',{ params: { username: this.addUserItem.username }})
        if(!code) {
          const addUserItem = this.addUserItem
          const { roleId } = addUserItem
          addUserItem.reservedInfos = ''
          if (this.getItem('roleName') === 'regionalAgent') {
            this.addUserItem.roleId=2
            addUserItem.superiorUserId = this.getItem('userId')
          }
          const { data: {code, message} } = await this.$axios.post('/user/addUser', addUserItem)
          if (!code&&this.isOnly) {
            this.addUserDialog = false
            this.$emit('showSnackbar', '添加成功')
            let pn=Math.floor((this.total+1)/10)+1
            this.$emit('updateUser',pn)
          } else {
            this.$emit('showSnackbar', message)
          }
          console.log('data', data)
        } else {
          this.$emit('showSnackbar', "账号或用户编号已存在")
        }
      },
      async checkUserNumber(){
        const { data: { code, message }} = await this.$axios.post('/user/checkUserNumber',{userNumber: this.addUserItem.userNumber })
        if(code) {
          this.$emit('showSnackbar', message)
        }else{
          this.isOnly=true
        }
      }
    }
  }
</script>

<style scoped>

</style>
