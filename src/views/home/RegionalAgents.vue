<template>
  <v-card>
    <v-data-table
            :headers="headers"
            :items="tableList"
            :search="search"
            :loading="isLoading"
            :server-items-length="total"
            :options.sync="tableOptions"
            hide-default-footer
            @update:page="handlePageChange"
            :footer-props="{
              itemsPerPageOptions: [10]
            }"
            :disable-pagination="true"
            loading-text="加载中... 请等待"
            no-results-text="没有查询到数据"
    >
      <template v-slot:top>
        <v-toolbar
                flat
        >
          <v-toolbar-title>
          </v-toolbar-title>
          <v-divider
                  class="mx-4"
                  inset
                  vertical
          ></v-divider>
           <div style="width: 150px"   v-if="listIndex === 0">
            <v-select
                    @change="handleUserListModeChange"
                    class="mt-1"
                    height="28px"
                    :items="UserListModeItems"
                    v-model="userListSearchMode"
                    item-text="label"
                    item-value="value"
                    :value="1"
                    hide-details
                    label="选择搜索模式"
            ></v-select>
          </div>
         <!-- <div style="width: 80px"   v-if="listIndex === 2">
            <v-select
                    @change="handleModeChange"
                    class="mt-1"
                    height="28px"
                    :items="modeItems"
                    value="ALL"
                    hide-details
                    label="选择模式"
            ></v-select>
          </div>
          <div style="width: 80px"   v-if="listIndex === 2">
            <v-select
                    @change="handleResultJudgmentChange"
                    class="mt-1"
                    height="28px"
                    :items="resultJudgmentItems"
                    value="ALL"
                    hide-details
                    label="选择结果"
            ></v-select>
          </div>
          <v-divider
                  v-if="listIndex === 2"
                  class="mx-4"
                  inset
                  vertical
          ></v-divider> -->
          <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  @keyup="handleSearch"
                  label="查询"
                  single-line
                  hide-details
          ></v-text-field>
          <v-divider
                  class="mx-4"
                  inset
                  vertical
          ></v-divider>
          <component :is="dialogComponent"
                     @showSnackbar="showSnackbar" 
                     @updateUser="getAgentList"
          ></component>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <div v-if="listIndex === 0">
          <!-- <v-icon
                  class="mr-2"
                  @click="searchUserDevice(item)"
          >
            mdi-book-search
          </v-icon> -->
          <v-icon
            class="mr-2"
          >
            mdi-access-point
          </v-icon>
          <v-icon
                  class="mr-2"
                  @click="deleteItem(item)"
          >
            mdi-delete
          </v-icon>
          <userModifyDialog 
                :editedItem="item"
                @showSnackbar="showSnackbar"
                @updateUser="getAgentList"
          >
          </userModifyDialog>
        </div>
        <!-- <div v-if="listIndex === 1">
          <v-icon
                  class="mr-2"
                  @click="searchDeviceData(item)"
          >
            mdi-cog-transfer
          </v-icon>
          <v-icon
                  @click="deleteDeviceItem(item)"
          >
            mdi-delete
          </v-icon>
        </div> -->
      </template>
      <template v-slot:no-data>
        没有数据
      </template>
    </v-data-table>
    <v-pagination
          v-model="tableOptions.page"
          class="my-4"
          :length="(total/10)%1==0?total/10:Math.floor(total/10)+1"
          :total-visible="10"
        ></v-pagination>
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
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">确认删除该数据？</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDeleteDialog">取消</v-btn>
          <v-btn color="blue darken-1" text @click="deleteItemConfirm">确认</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-footer
      inset
      height="50px"
    >
    </v-footer>
    <v-footer
      fixed
      inset
      style="z-index:100"
      color="rgba(255, 255, 255)"
      height="40px"
      class="justify-center"
    >
      <a href="https://beian.miit.gov.cn" class="grey--text text--lighten-1 text-decoration-none text-caption">粤ICP备2020091671号</a>
    </v-footer>
  </v-card>
</template>

<script>
  import agentListDialog from "../../components/userList/agentListDialog"
  import deviceListDialog from "../../components/userList/deviceListDialog"
  import deviceDataListDialog from "../../components/userList/deviceDataListDialog"
  import userModifyDialog from "../../components/userList/userModifyDialog"
  export default {
    name: "RegionalAgents",
    components: {
      agentListDialog,
      deviceListDialog,
      deviceDataListDialog,
      userModifyDialog
    },
    data() {
      return {
        isLoading: false,
        lastPn: 1,
        currentUserId: -1,
        currentDeviceId: -1,
        // 表格
        tableOptions: {
          page: 1,
          itemsPerPage: 10,
        },
        // 面包屑导航
        breadcrumbsItems: [
          {
            text: '用户列表',
            disabled: false,
	          link: true,
          }
        ],
        // 列表索引
        listIndex: 0,
        // 表头
        agentHeaders: [
          {
            text: '代理商编号',
            align: 'start',
            value: 'userNumber',
          },
          { text: '代理商名称', value: 'name', sortable: false },
          { text: '联系方式', value: 'contactInfo', sortable: false },

          { text: '备注', value: 'message', sortable: false },
          { text: '操作', value: 'actions', sortable: false },
        ],
        // 列表
        agentList: [],
        // 添加用户 - 选择确实框 select
        roleList: [],
        // 添加用户 - 选择代理商 select
        agentBriefInfoList: [],
        // 添加用户 - 表单是否验证
        valid: false,
        // 提示框是否展示
        snackbar: false,
        // 提示框文字
        snackbarHint: '出现了一些错误',
        // 添加用户 - 表单验证规则
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
          password2: [
            value => (value && value === this.addUserItem.password) || '密码不一致',
          ],
          name: [
            value => (value && value.length >= 1 && value.length <= 32) || '字符长度为 1~32',
          ],
          contact: [
            value => (value && value.length >= 1 && value.length <= 24) || '字符长度为 1~24',
            value => /^(((\+\d{2}-)?0\d{2,3}-\d{7,8})|((\+\d{2}-)?(\d{2,3}-)?([1][0-9][0-9]\d{8})))$/.exec(value) || '请输入正确的电话号码'
          ],
          address: [

          ],
          message: [
            value => (value.length <= 128) || '字符长度为 0~128',
          ]
        },
        // 总数
        total: 0,
        // 搜索用户
        search: '',
        // 是否展示添加用户 Dialog
        addUserDialog: false,
        // 是否展示删除用户 Dialog
        deleteDialog: false,
        UserListModeItems: [{
          label: '代理商名称',
          value: 1
        }, {
          label: '代理商编号',
          value: 0
        }],
        userListSearchMode: 1,
        searchMode: 'ALL',
        searchResultJudgment: 'ALL',
        // 列表操作
        editedIndex: -1,
        editedItem: null,
      }
    },
    watch: {
      addUserDialog (val) {
        if (val) {
          this.getRoleList()
          this.getAgentBriefInfoList()
        } else {
          this.closeAddUserDialog()
        }
      },
      deleteDialog (val) {
        val || this.closeDeleteDialog()
      },
      // listIndex (val) {
      //   const breadcrumbsItems = [
      //     {
      //       text: '用户列表',
      //       disabled: false,
      //     },
      //     {
      //       text: this.currentUserName?this.currentUserName+'-设备列表':'设备列表',
      //       disabled: false,
      //     },
      //     {
      //       text: this.currentDeviceName?this.currentDeviceName+'-设备数据':'设备数据',
      //       disabled: true
      //     }]
      //   switch (val) {
      //     case 0:
      //       this.getUserList()
      //       break
      //     case 1:
      //       this.getDeviceList()
      //   }
      //   breadcrumbsItems.forEach(item => {
      //     item.disabled = false
      //   })
      //   breadcrumbsItems[this.listIndex].disabled = true
      //   this.breadcrumbsItems = breadcrumbsItems.slice(0, this.listIndex + 1)
      // }
    },
    computed: {
      dialogComponent() {
        const dialogs = ['agentListDialog', 'deviceListDialog', 'deviceDataListDialog']
        return dialogs[this.listIndex]
      },
      headers () {
        const headers = [this.agentHeaders]
        return headers[this.listIndex]
      },
      tableList() {
        const list = [this.agentList]
        return list[this.listIndex]
      }
    },

    async created () {
      try {
        await this.getAgentList()
      } catch (e) {
        this.showSnackbar('token 已过期，请重新登录')
      }
    },
    methods: {
      // 新增 Dialog
      async getRoleList() {
        const { data: { data }} = await this.$axios.get('/role/findRole')
        this.roleList = data
      },
      // 获取代理商列表
      async getAgentBriefInfoList() {
        const { data: { data }} = await this.$axios.get('/user/findRegionalAgentBriefInfo')
        this.agentBriefInfoList = data;
      },
      // 新增 user
      async handleAddUser() {
        if (!this.valid) {
          this.showSnackbar('请正确填写信息')
          return
        }
        const { data: { code, message }} = await this.$axios.get('/user/checkUser',{ params: { username: this.addUserItem.username }})
        if(!code) {
          const addUserItem = this.addUserItem
          const { roleId } = this.addUserItem
          // 普通用户为 2
          // 区域代理商为 3
          switch (roleId) {
            case 2:
              break
            case 3:
              break
          }
          const { data } = await this.$axios.post('/user/addUser', addUserItem)
        } else {
          this.showSnackbar(message)
        }
      },
      // 获取全部代理商信息      
       async getAgentList(pn = 1, userName = '', userNumber = '', searchMode = false){
        const { data: {data: {list , total}}} = await this.$axios.get('/user/findUser',{
          params: {
            loginUserId: this.getItem('userId'),
            pn,
            roleName: 'agent',
            userName,
            userNumber
          }
        })
        searchMode || (this.agentList = list)
        this.total = total
        console.log(list);
        return list
      },
      // // 获取用户列表
      // async getUserList(pn = 1, userName = '', userNumber = '', searchMode = false){
      //   const { data: {data: {list , total}}} = await this.$axios.get('/user/findUser',{
      //     params: {
      //       token: this.getItem('token'),
      //     }
      //   })
      //   searchMode || (this.userList = list)
      //   this.total = total
      //   console.log(list);
      //   return list
      // },
      // 展示消息框
      showSnackbar(message) {
        this.snackbar = true
        this.snackbarHint = message
      },
      // 删除用户
      deleteItemConfirm() {
        switch (this.listIndex) {
          case 0:
            this.$axios.delete('/user/deleteUserByUserNumber',{
                data: {
                  userNumber:this.editedItem.userNumber
                }
              }).then((response) => {
                console.log('response', response.data.code)
                if (!response.data.code) {
                  this.showSnackbar('删除成功')
                } else {
                  this.showSnackbar('删除失败')
                }
              })
              .catch(res => {
                this.showSnackbar('删除失败')
              })
              .finally(this.getAgentList)
            break
          // case 1:
          //   this.$axios.delete('/device/deleteDevice',{
          //     data: {
          //       deviceId: this.editedItem.deviceId
          //     }
          //   })
          //     .then((response) => {
          //       console.log('response', response.data.code)
          //       if (!response.data.code) {
          //         this.showSnackbar('删除成功')
          //       } else {
          //         this.showSnackbar('删除失败')
          //       }
          //     })
          //     .catch(res => {
          //       this.showSnackbar('删除失败')
          //     })
          //     .finally(this.getDeviceList)
          //   break
        }
        this.deleteDialog = false
      },
      deleteItem(item) {
        this.editedIndex = this.agentList.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.deleteDialog = true
      },

      // deleteDeviceItem(item) {
      //   this.editedIndex = this.userList.indexOf(item)
      //   this.editedItem = Object.assign({}, item)
      //   this.deleteDialog = true
      // },

      // Dialog 控制层
      closeAddUserDialog () {
        this.addUserDialog = false
      },
      closeDeleteDialog() {
        this.deleteDialog = false
      },
      // // 面包屑导航栏
      // handleBreadCrumbsClick(item) {
      //   this.listIndex = this.breadcrumbsItems.indexOf(item)
      // },
      async handlePageChange(page) {
        this.isLoading = true
        const methods = [this.getAgentList]
        await methods[this.listIndex](page)
        this.isLoading = false
      },
      // handleModeChange(mode) {
      //   this.searchMode = mode
      //   this.getDeviceData(1, this.searchMode, this.searchResultJudgment)
      // },
      // handleResultJudgmentChange(resultJudgment) {
      //   this.searchResultJudgment = resultJudgment
      //   this.getDeviceData(1, this.searchMode, this.searchResultJudgment)
      // },
      async handleUserListModeChange() {
        await this.handleSearch()
      },
      async handleSearch() {
        switch (this.listIndex) {
          case 0:
            let list = []
            if (this.userListSearchMode) {
               list = await this.getAgentList(1, this.search, '', true)
            } else {
               list = await this.getAgentList(1, '', this.search, true)
            }
            this.agentList = list
            this.total = list.length
            break
          // case 1:
          //   break
          // case 2:
          //   this.getDeviceData(1, this.searchMode, this.searchResultJudgment, this.search)
          //   break
        }
      },
      searchSN(str) {
        this.getDeviceData(1, this.searchMode, this.searchResultJudgment, this.search)
      }
    }
  }
</script>

<style scoped>

</style>
