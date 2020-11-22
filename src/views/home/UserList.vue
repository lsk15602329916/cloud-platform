<template>
  <v-card>
    <v-snackbar
            v-model="snackbar"
    >
      {{ snackbarHint }}
      <template v-slot:action="{ attrs }">
        <v-btn
                color="pink"
                text
                v-bind="attrs"
                @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-data-table
            :headers="headers"
            :items="tableList"
            :search="search"
            :loading="isLoading"
            :server-items-length="total"
            :options.sync="tableOptions"
            @update:page="handlePageChange"
            loading-text="加载中... 请等待"
            no-results-text="没有查询到数据"
    >
      <template v-slot:top>
        <v-toolbar
                flat
        >
          <v-toolbar-title>
            <v-breadcrumbs
                :items="breadcrumbsItems"
                divider=">"
                style="padding: 0!important;"
                large>
              <template v-slot:item="{ item }">
                <v-breadcrumbs-item
                        :disabled="item.disabled"
                        @click="handleBreadCrumbsClick(item)"
                >
                  {{ item.text }}
                </v-breadcrumbs-item>
              </template>
            </v-breadcrumbs>
          </v-toolbar-title>
          <v-divider
                  class="mx-4"
                  inset
                  vertical
          ></v-divider>
          <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="查询"
                  single-line
                  hide-details
          ></v-text-field>
          <v-divider
                  class="mx-4"
                  inset
                  vertical
          ></v-divider>
          <component :is="dialogComponent" @showSnackbar="showSnackbar"></component>
          <v-dialog v-model="deleteDialog" max-width="500px">
            <v-card>
              <v-card-title class="headline">确认删除该用户？</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDeleteDialog">取消</v-btn>
                <v-btn color="blue darken-1" text @click="deleteItemConfirm">确认</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon
                class="mr-2"
                @click="searchUserDevice(item)"
        >
          mdi-book-search
        </v-icon>
          <v-icon
                  @click="deleteItem(item)"
          >
            mdi-delete
          </v-icon>
      </template>
      <template v-slot:no-data>
        没有数据
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
  import userListDialog from "../../components/userList/userListDialog"
  import deviceListDialog from "../../components/userList/deviceListDialog"
  export default {
    name: "UserList",
    components: {
      userListDialog,
      deviceListDialog
    },
    data() {
      return {
        isLoading: false,
        lastPn: 1,
        // 表格
        tableOptions: {
          page: 1,
          itemsPerPage: 15,
        },
        // 面包屑导航
        breadcrumbsItems: [
          {
            text: '用户列表',
            disabled: false,
          }
        ],
        // 列表索引
        listIndex: 0,
        // 表头
        userHeaders: [
          {
            text: '用户编号',
            align: 'start',
            value: 'userNumber',
          },
          { text: '用户姓名', value: 'name', sortable: false },
          { text: '联系方式', value: 'contact', sortable: false },
          { text: '备注', value: 'message', sortable: false },
          { text: '操作', value: 'actions', sortable: false },
        ],
        deviceHeaders: [
          {
            text: '设备序号',
            align: 'start',
            value: 'deviceNumber',
          },
          { text: '设备名称', value: 'deviceName', sortable: false },
          { text: '有关信息', value: 'message', sortable: false },
          { text: '操作', value: 'actions', sortable: false },
        ],
        // 用户列表
        userList: [],
        // 设备列表
        deviceList: [],
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
        // 添加用户数据格式
        addUserItem: {
          roleId: '',
          userNumber: '',
          username: '',
          password: '',
          password2: '',
          name: '',
          contact: '',
          address: '',
          // 旗上区域代理商的id
          superiorUserId: '',
          message: ''
        },

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
      listIndex (val) {
        const breadcrumbsItems = [
          {
            text: '用户列表',
            disabled: false,
          },
          {
            text: '设备列表',
            disabled: true,
          }]
        switch (val) {
          case 0:
            this.getUserList()
            break
        }
        this.breadcrumbsItems = breadcrumbsItems.slice(0, this.listIndex + 1)
      }
    },
    computed: {
      dialogComponent() {
        const dialogs = ['userListDialog', 'deviceListDialog']
        return dialogs[this.listIndex]
      },
      headers () {
        const headers = [this.userHeaders, this.deviceHeaders]
        return headers[this.listIndex]
      },
      tableList() {
        const list = [this.userList, this.deviceList]
        return list[this.listIndex]
      }
    },

    async created () {
      try {
        await this.getUserList()
      } catch (e) {
        this.showSnackbar('token 已过期，请重新登录')
      }
    },
    methods: {
      async getRoleList() {
        const { data: { data }} = await this.$axios.get('/role/findRole')
        this.roleList = data
      },
      async getAgentBriefInfoList() {
        const { data: { data }} = await this.$axios.get('/user/findRegionalAgentBriefInfo')
        this.agentBriefInfoList = data
      },
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
          }
          const { data } = await this.$axios.post('/user/addUser', addUserItem)
        } else {
          this.showSnackbar(message)

        }
      },
      async getUserList(pn = 1){
        const { data: {data: {list , total}} } = await this.$axios.get('/user/findUser',{
          params: {
            loginUserId: this.getItem('userId'),
            pn,
            roleName: 'user',
            userName: '',
            userNumber: ''
          }
        })
        this.userList = list
        this.total = total
      },
      async getDeviceList() {
        const { data: { data: { list, total }}} = await this.$axios.get('/device/findDeviceList',{
          params: {
            pn: 1,
            deviceNumber: '',
            deviceName: '',
            userId: this.editedItem.userId
          }
        })
        this.deviceList = list
        this.total = total
      },
      // 展示消息框
      showSnackbar(message) {
        this.snackbar = true
        this.snackbarHint = message
      },
      // 查询用户设备
      async searchUserDevice(item) {
        this.deviceList = []
        this.editedIndex = this.userList.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.listIndex = 1
        await this.getDeviceList()
      },
      // 删除用户
      deleteItemConfirm() {
        console.log('index', this.editedIndex)
        console.log('item', this.editedItem)
      },
      deleteItem(item) {
        this.editedIndex = this.userList.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.deleteDialog = true
      },

      // Dialog 控制层
      closeAddUserDialog () {
        this.addUserDialog = false
      },
      closeDeleteDialog() {
        this.deleteDialog = false
      },
      // 面包屑导航栏
      handleBreadCrumbsClick(item) {
        this.listIndex = this.breadcrumbsItems.indexOf(item)
      },
      handlePageChange(page) {
        this.getUserList(page)
      },
    }
  }
</script>

<style scoped>

</style>
