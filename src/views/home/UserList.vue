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

            <v-breadcrumbs
                :items="breadcrumbsItems"
                divider=">"
                style="padding: 0!important;"
                large>
              <template v-slot:item="{ item }">
                <v-breadcrumbs-item
	                      :style="{
                	        color: item.disabled ? 'auto' : '#42A5F5',
                	        cursor: item.disabled ? 'auto' : 'pointer',
	                      }"
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
          <div style="width: 100px"   v-if="listIndex === 0">
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
          <div style="width: 100px"   v-if="listIndex === 1">
            <v-select
                    @change="handleDataListModeChange"
                    class="mt-1"
                    height="28px"
                    :items="DeviceDataModeItems"
                    v-model="deviceListSearchMode"
                    item-text="label"
                    item-value="value"
                    :value="1"
                    hide-details
                    label="选择搜索模式"
            ></v-select>
          </div>
          <div style="width: 90px"   v-if="listIndex === 2">
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
          <div style="width: 90px"   v-if="listIndex === 2">
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
          ></v-divider>
          <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  
                  @input="handleSearch"
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
                      class="d-flex flex-nowrap"
                     @showSnackbar="showSnackbar"
                     :currentDeviceId="currentDeviceId"
                     :currentUserId="currentUserId"
                     @updateDevice="getDeviceList"
                     @updateDeviceData="getDeviceData"
                     @updateUser="getUserList"
                     :total="total"
          ></component>
        </v-toolbar>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <div v-if="listIndex === 0">
          <v-icon
                  class="mr-2"
                  @click="searchUserDevice(item)"
          >
            mdi-book-search
          </v-icon>
          <v-icon
            v-if="item.onlineStatus==1"
            color="green"
          >
            mdi-access-point
          </v-icon>
          <v-icon
            v-else
          >
            mdi-access-point
          </v-icon>
          <v-icon
                  class="mr-2"
                  @click="deleteUser(item)"
          >
            mdi-delete
          </v-icon>
          <userModifyDialog 
                :editedItem="item"
                @showSnackbar="showSnackbar"
                @updateUser="getUserList"
          >
          </userModifyDialog>
        </div>
        <div v-if="listIndex === 1">
          <v-icon
                  class="mr-2"
                  @click="searchDeviceData(item)"
          >
            mdi-cog-transfer
          </v-icon>
          <v-icon
                  class="mr-2"
                  @click="deleteDeviceItem(item)"
          >
            mdi-delete
          </v-icon>
          <deviceModifyDialog
                :deviceMsg="item"
                @showSnackbar="showSnackbar"
                @updateDevice="getDeviceList"
          ></deviceModifyDialog>
        </div>
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
  import userListDialog from "../../components/userList/userListDialog"
  import agentListDialog from "../../components/userList/agentListDialog"
  import deviceListDialog from "../../components/userList/deviceListDialog"
  import deviceDataListDialog from "../../components/userList/deviceDataListDialog"
  import userModifyDialog from "../../components/userList/userModifyDialog"
  import deviceModifyDialog from "../../components/userList/deviceModifyDialog"
  export default {
    name: "UserList",
    components: {
      userListDialog,
      deviceListDialog,
      deviceDataListDialog,
      userModifyDialog,
      deviceModifyDialog,
      agentListDialog
    },
    data() {
      return {
        isLoading: false,
        lastPn: 1,
        currentUserId: -1,
        currentDeviceId: -1,
        currentUserName:null,
        currentDeviceName: null,
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
        userHeaders: [
          { text: '用户账号', align: 'start',value: 'username', sortable: false},
          { text: '用户编号', value: 'userNumber', sortable: false},
          { text: '用户名称', value: 'name', sortable: false },
          { text: '联系方式', value: 'contactInfo', sortable: false },
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
            value: 'dataId',
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
          { text: '预留项', value: 'reservedMessage', sortable: false }
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
        resultJudgmentItems: ['ALL', 'Accept', 'Reject'],
        UserListModeItems: [{
          label: '用户名称',
          value: 1
        }, {
          label: '用户编号',
          value: 0
        }],        
        userListSearchMode: 1,
        DeviceDataModeItems:[{
          label: '设备名称',
          value: 1
        },{
          label: '设备编号',
          value: 0
        }],
        deviceListSearchMode:1,
        searchMode: 'ALL',
        searchResultJudgment: 'ALL',
        // 列表操作
        editedIndex: -1,
        editedItem: null,
        //保存请求页数
        userPn:1,
        devicePn:1,
        daviceDataPn:1
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
            text: this.currentUserName?this.currentUserName+'-设备列表':'设备列表',
            disabled: false,
          },
          {
            text: this.currentDeviceName?this.currentDeviceName+'-设备数据':'设备数据',
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
        const dialogs = ['userListDialog', 'deviceListDialog', 'deviceDataListDialog','agentListDialog']
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
        console.log('role',data);
      },
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
      // 获取用户列表
      async getUserList(pn = this.userPn, userName = '', userNumber = '', searchMode = false){
        this.isLoading=true
        this.tableOptions.page=pn
        this.userPn=pn
        const { data: {data: {list , total}}} = await this.$axios.get('/user/findUser',{
          params: {
            loginUserId: this.getItem('userId'),
            pn,
            roleName: 'user',
            userName,
            userNumber
          }
        })
        searchMode || (this.userList = list)
        console.log(list);
        this.isLoading=false
        this.total = total
        return list
      },
      //获取用户信息进行修改
      async getUserMsg(item){
        this.editedItem = Object.assign({}, item)
        console.log(this.editedItem);
      },
      // 获取设备列表
      async searchUserDevice(item) {
        this.deviceList = []
        this.editedIndex = this.userList.indexOf(item)
        this.editedItem = Object.assign({}, item)
        console.log('editedItem', this.editedItem);
        this.listIndex = 1
        this.currentUserName = this.editedItem.name
        await this.getDeviceList()
      },
      async getDeviceList(pn = this.devicePn,deviceName='',deviceNumber='') {
        this.isLoading=true
        this.currentUserId = this.editedItem.userId
        this.tableOptions.page=pn
        this.devicePn=pn   
        console.log(this.editedItem);
        const { data: { data: { list, total }}} = await this.$axios.get('/device/findDeviceList',{
          params: {
            pn,
            deviceNumber,
            deviceName,
            userId: this.currentUserId
          }
        })
        this.deviceList = list
        this.isLoading=false 
        this.total = total
        console.log('list', list)
        // return list
      },
      // 获取设备 Data
      async searchDeviceData(item) {
        this.resultJudgment
        this.editedIndex = this.deviceList.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.currentDeviceId = item.deviceId
        this.currentDeviceName=item.deviceName
        this.listIndex = 2
        await this.getDeviceData()
        console.log('item', item)
      },
      async getDeviceData(pn = this.daviceDataPn, testMode = 'ALL', resultJudgment = 'ALL', groupId = this.search) {
        this.tableOptions.page=pn
        this.daviceDataPn=pn
        const { deviceId } = this.editedItem
        const { data, data: { data: { headers, pageInfo: { list, total }}}} = await this.$axios.get('/deviceData/findDeviceData',{ params: {
            pn,
            deviceId,
            testMode,
            resultJudgment,
            testedBarCode:'',
            groupId
          }})
        this.deviceDataList = list
        console.log('list', total)
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
            this.$axios.delete('/user/deleteUserByUserNumber',{
                data: {
                  userNumber:this.editedItem.userNumber
                }
              }).then((response) => {
                console.log('response', response.data.code)
                if (!response.data.code) {
                  this.showSnackbar('删除成功')
                  let total =this.total - 1
                  this.userPn=(total/10)%1==0?total/10:Math.floor(total/10)+1
                } else {
                  this.showSnackbar('删除失败')
                }
              })
              .catch(res => {
                this.showSnackbar('删除失败')
              })
              .finally(this.getUserList)
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
                  let total =this.total - 1
                  this.devicePn=(total/10)%1==0?total/10:Math.floor(total/10)+1
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
      deleteUser(item) {
        this.editedIndex = this.userList.indexOf(item)
        this.editedItem = Object.assign({}, item)
        console.log(this.editedItem );
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
      async handlePageChange(page) {
        this.isLoading = true
        const methods = [this.getUserList, this.getDeviceList, this.getDeviceData]
        await methods[this.listIndex](page)
        this.isLoading = false
      },
      handleModeChange(mode) {
        this.searchMode = mode
        this.getDeviceData(1, this.searchMode, this.searchResultJudgment)
      },
      handleResultJudgmentChange(resultJudgment) {
        this.searchResultJudgment = resultJudgment
        this.getDeviceData(1, this.searchMode, this.searchResultJudgment)
      },
      async handleUserListModeChange() {
        await this.handleSearch()
      },
      async handleDataListModeChange() {
        await this.handleSearch()
      },
      async handleSearch(e) {
        if(/^(\w|-)+$/.test(e)||e.length===0) {
          let list = []
        switch (this.listIndex) {
          case 0:
            if (this.userListSearchMode) {
               list = await this.getUserList(1, this.search, '', true)
            } else {
               list = await this.getUserList(1, '', this.search, true)
            }
            console.log(list);
            this.userList = list
            // this.total = list.length
            break
          case 1:
            if(this.deviceListSearchMode){
              list = this.getDeviceList(1, this.search ,'')
            }else{
              list = this.getDeviceList(1, '',this.search)
            }
            console.log(list);
            // this.deviceList = list
            break
          case 2:
            this.getDeviceData(1, this.searchMode, this.searchResultJudgment, this.search)
            break
        }
        }      

      },
      searchSN(str) {
        this.getDeviceData(1, this.searchMode, this.searchResultJudgment, this.search)
      },
    }
  }
</script>

<style scoped>

</style>
