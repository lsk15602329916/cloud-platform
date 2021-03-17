<template>
  <v-dialog
          v-model="addUserDialog"
          max-width="800px"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-icon
              class="mr-2"
              v-bind="attrs"
              v-on="on"
              @click="handleUserModify"
      >
        mdi-account-cog
      </v-icon>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">用户信息修改</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-form v-model="valid">
            <v-row>
              <v-col
                      v-if="userItem.superiorUserId"
                      cols="12"
                      sm="6"
                      md="4"
              >
                <v-text-field   
                        v-model="agentName"
                        label="所属代理商"
                        disabled
                ></v-text-field>
              </v-col>
              <v-col
                      cols="12"
                      sm="6"
                      md="4"
              >
                <v-text-field
                        v-model="userItem.name"
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
                        v-model="userItem.contactPerson"
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
                        v-model="userItem.contactInfo"
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
                        v-model="userItem.address"
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
                        v-model="userItem.message"
                        label="备注"
                        :rules="rules.message"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row  dense v-for="(item,index) in reservedInfoList" :key="'r'+index"> 
                  <v-col
                      cols="24"
              >
                <v-text-field
                        v-model="reservedInfoList[index]"
                        :label="'预留信息'+ (index+1)"
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
                    @click="addReservedInformation"
                >
                  新增预留信息
                </v-btn>
        <v-btn
                color="blue darken-1"
                text
                @click="closeUserModifyDialog"
        >
          取消
        </v-btn>
        <v-btn
                color="blue darken-1"
                text
                @click="updateUserInfo"
        >
          确认
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    name: "userModifyDialog",
    data: () => ({
      roleList: [],
      agentBriefInfoList: [],
      addUserDialog: false,
      // 添加用户 - 表单是否验证
      valid: false,
      // 添加用户数据格式
      userItem: {},
      reservedInfoList:[],
      // 用户所属代理商
      agentName:'',
      rules: {
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
    props:["editedItem"],
    watch: {
      userModifyDialog(val) {
        if (val) {
          // this.getRoleList()
          // this.getAgentBriefInfoList()
        
        } else {
          this.closeUserModifyDialog()
        }
      },
    },
    methods: {
      handleUserModify(){
          let a = Object.assign({}, this.editedItem)
          this.userItem=a
          this.getAgentInfo()
          console.log(this.userItem);
          this.reservedInfoList=a.reservedInfoList
          console.log(this.reservedInfoList);
      },
      // handleVerifyPassword(value) {
      //   if (value && value === this.userItem.password) {
      //     return true
      //   } else {
      //     return '密码不一致'
      //   }
      // },
    //   async getRoleList() {
    //     const { data: { data }} = await this.$axios.get('/role/findRole')
    //     this.roleList = data
    //   },
    //   async getAgentBriefInfoList() {
    //     const { data: { data }} = await this.$axios.get('/user/findRegionalAgentBriefInfo')
    //     this.agentBriefInfoList = data
    //     console.log('agent', this.agentBriefInfoList)
    //   },
      // Dialog 控制层
      closeUserModifyDialog () {
        this.addUserDialog = false
      },
        async updateUserInfo() {
        if (!this.valid) {
          return
        }
        const userItem=this.userItem
        // for (let item of userInfo) {
        //   form[item] = this.getItem(item)
        // }
        // if (this.getItem('roleName') === 'user') {
        //   form.superiorUserId = this.superiorUserId
        // }
        // 预留信息

        // for(let item of this.userItem.reservedInfoList){
        //   if(item.length!==0){
        //     reservedInfoList.push(item)
        //   }
        // }
        // userItem.reservedInfoList = reservedInfoList
        userItem.reservedInfoList=this.reservedInfoList
        console.log(userItem.reservedInfoList);
        const { data: {data, code, message}} = await this.$axios.post('/user/updateUserInfo', userItem)
        if(!code){
          this.addUserDialog = false
            this.$emit('showSnackbar', '信息修改成功')
            this.$emit('updateUser')
        }
        // console.log(data);
        console.log('mess', message)
      },
      async getAgentInfo() {
          const { data: { code, message,data }} = await this.$axios.get('/user/selectUserinfoByUserId',{ params: { userId: this.userItem.superiorUserId }})
          if(!code){
            this.agentName=data.name
            console.log(this.agentName);
          }
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
    }
  }
</script>

<style scoped>

</style>
