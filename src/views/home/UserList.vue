<template>
  <v-card>
    <v-data-table
            :headers="headers"
            :items="tableList"
            :search="search"
            :loading="isLoading"
            :server-items-length="total"
            :options.sync="tableOptions"
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
          <div style="width: 100px"   v-if="listIndex === 2">
            <v-select
                    @change="handleModeChange"
                    class="mt-1"
                    height="28px"
                    :items="modeItems"
                    value="PLR"
                    hide-details
                    label="选择模式"
            ></v-select>
          </div>
          <v-divider
                  v-if="listIndex === 2"
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
          <component :is="dialogComponent" @showSnackbar="showSnackbar" :currentUserId="currentUserId" @updateDevice="getDeviceList"></component>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <div v-if="listIndex === 0">
          <v-icon
                  class="mr-2"
                  @click="searchUserDevice(item)"
          >
            mdi-book-search
          </v-icon>
<!--          <v-icon-->
<!--                  @click="deleteItem(item)"-->
<!--          >-->
<!--            mdi-delete-->
<!--          </v-icon>-->
        </div>
        <div v-if="listIndex === 1">
          <v-icon
                  class="mr-2"
                  @click="searchDeviceData(item)"
          >
            mdi-book-search
          </v-icon>
          <v-icon
                  @click="deleteDeviceItem(item)"
          >
            mdi-delete
          </v-icon>
        </div>
      </template>
      <template v-slot:no-data>
        没有数据
      </template>
    </v-data-table>
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
  </v-card>
</template>

<script>
  import userListDialog from "../../components/userList/userListDialog"
  import deviceListDialog from "../../components/userList/deviceListDialog"
  import deviceDataListDialog from "../../components/userList/deviceDataListDialog"
  export default {
    name: "UserList",
    components: {
      userListDialog,
      deviceListDialog,
      deviceDataListDialog
    },
    data() {
      return {
        isLoading: false,
        lastPn: 1,
        currentUserId: -1,
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
        deviceDataHeaders: [
          {
            text: '全球唯一ID',
            align: 'start',
            value: 'deviceNumber',
          },
          { text: '组号', value: 'groupId', sortable: false },
          { text: '日期', value: 'date', sortable: false },
          { text: '时间', value: 'time', sortable: false },
          { text: '结果', value: 'resultJudgment', sortable: false },
          { text: '测试模式', value: 'testMode', sortable: false },
          { text: '数据项1', value: 'dataItem1', sortable: false },
          { text: '数据项1单位', value: 'dataItem1Unit', sortable: false },
          { text: '数据项2', value: 'dataItem2', sortable: false },
          { text: '数据项2单位', value: 'dataItem2Unit', sortable: false },
          { text: '数据项3', value: 'dataItem3', sortable: false },
          { text: '数据项3单位', value: 'dataItem3Unit', sortable: false },
          { text: '运行次数', value: 'runNumber', sortable: false },
          { text: '被测试条形码', value: 'testedBarCode', sortable: false },
          { text: '节拍输出', value: 'beatOutput', sortable: false },
        ],
        // 用户列表
        userList: [],
        // 设备列表
        deviceList: [],
        // 设备 Data
        deviceDataList: [],
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

        // mode Item
        modeItems: ['ALL', 'PLR', 'PDL', 'CPDL', 'OCC', 'VXXX', 'MFR'],
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
            disabled: false,
          },
          {
            text: '设备数据',
            disabled: true
          }]
        switch (val) {
          case 0:
            this.getUserList()
            break
          case 1:
            this.getDeviceList()
        }
        breadcrumbsItems.forEach(item => {
          item.disabled = false
        })
        breadcrumbsItems[this.listIndex].disabled = true
        this.breadcrumbsItems = breadcrumbsItems.slice(0, this.listIndex + 1)
      }
    },
    computed: {
      dialogComponent() {
        const dialogs = ['userListDialog', 'deviceListDialog', 'deviceDataListDialog']
        return dialogs[this.listIndex]
      },
      headers () {
        const headers = [this.userHeaders, this.deviceHeaders, this.deviceDataHeaders]
        return headers[this.listIndex]
      },
      tableList() {
        const list = [this.userList, this.deviceList, this.deviceDataList]
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
      // 新增 Dialog
      async getRoleList() {
        const { data: { data }} = await this.$axios.get('/role/findRole')
        this.roleList = data
      },
      async getAgentBriefInfoList() {
        const { data: { data }} = await this.$axios.get('/user/findRegionalAgentBriefInfo')
        this.agentBriefInfoList = data
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
          }
          const { data } = await this.$axios.post('/user/addUser', addUserItem)
        } else {
          this.showSnackbar(message)

        }
      },
      // 获取用户列表

      async getUserList(pn = 1){
        const { data: {data: {list , total}}} = await this.$axios.get('/user/findUser',{
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
      // 获取设备列表
      async searchUserDevice(item) {
        this.deviceList = []
        this.editedIndex = this.userList.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.listIndex = 1
        await this.getDeviceList()
      },
      async getDeviceList(pn = 1) {
        this.currentUserId = this.editedItem.userId
        const { data: { data: { list, total }}} = await this.$axios.get('/device/findDeviceList',{
          params: {
            pn,
            deviceNumber: '',
            deviceName: '',
            userId: this.currentUserId
          }
        })
        this.deviceList = list
        this.total = total
        console.log('list', list)
      },
      // 获取设备 Data
      async searchDeviceData(item) {
        this.editedIndex = this.deviceList.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.listIndex = 2
        await this.getDeviceData()
        console.log('item', item)
      },
      async getDeviceData(pn = 1, testMode = 'ALL') {
        const { deviceId } = this.editedItem
        const { data, data: { data: { headers, pageInfo: { list, total }}}} = await this.$axios.get('/deviceData/findDeviceData',{ params: {
            pn,
            deviceId,
            testMode,
            groupId: ''
          }})
        this.deviceDataList = list
        this.total = total
      },
      // 展示消息框
      showSnackbar(message) {
        this.snackbar = true
        this.snackbarHint = message
      },
      // 删除用户
      deleteItemConfirm() {
        switch (this.listIndex) {
          case 0:
            break
          case 1:
            this.$axios.delete('/device/deleteDevice',{
              data: {
                deviceId: this.editedItem.deviceId
              }
            })
              .then((response) => {
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
              .finally(this.getDeviceList)
            break
        }
        this.deleteDialog = false
      },
      deleteItem(item) {
        this.editedIndex = this.userList.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.deleteDialog = true
      },

      deleteDeviceItem(item) {
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
        const methods = [this.getUserList, this.getDeviceList, this.getDeviceData]
        methods[this.listIndex](page)
      },
      handleModeChange(mode) {
        this.getDeviceData(1, mode)
      },
    }
  }
</script>

<style scoped>

</style>
