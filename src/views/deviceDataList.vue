<template>

  <v-card>
      <div>
    <v-app-bar
            app
            color="primary"
            dark
            clipped-left
    >
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-toolbar-title>上腾科技云平台</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
              text
              @click="handleQuit"
      >
        <span class="mr-2">退出</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>
  </div>
    <v-data-table
            class="mt-16"
            :headers="headers"
            :items="deviceDataList"
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
          <v-divider
                  class="mx-4"
                  inset
                  vertical
          ></v-divider>
          <div style="width: 90px" >
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
          <div style="width: 90px" >
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
                  class="mx-4"
                  inset
                  vertical
          ></v-divider>
          <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  @input="handleSearch"
                  label="查询(通过被测试条形码)"
                  single-line
                  hide-details
          ></v-text-field>
          <v-divider
                  class="mx-4"
                  inset
                  vertical
          ></v-divider>
        </v-toolbar>
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
export default {
  name:'deviceDataList',
  data (){
    return{
      isLoading: false,
      deviceId: null,
      // 分页
      tableOptions: {
        page: 1,
        itemsPerPage: 10,
      },
      // 表头
      headers: [
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
      // 表格数据
      deviceDataList: [],
      // 总数
      total: 0,
      // 搜索
      search: '',
      // 选择模式
      modeItems: ['ALL', 'PLR', 'PDL', 'CPDL', 'OCC', 'VXXX', 'MFR', 'DPD', 'DPR', 'VDPD', 'VDPR', 'CDPD', 'CVDPD', 'VPLR', 'VPDL', 'CVPDL', 'VSFD', 'SPD', 'SPR', 'VSPD', 'VSPR'],
      // 选择结果
      resultJudgmentItems: ['ALL', 'Accept', 'Reject', 'Test_Stop', 'High_Test_P', 'Low_Test_P', 'Higher_Max_P', 'Lower_Min_P', 'Severe_Leak', 'Test_Error', 'High_P_Range', 'Test_Type_Err'],
      // 搜索模式
      searchMode: 'ALL',
      // 结果
      searchResultJudgment: 'ALL',
      //保存请求页数
      userPn:1,
      devicePn:1,
      daviceDataPn:1
    }
  },
  created(){
    this.deviceId = this.getItem('deviceId')
    this.getDeviceData()
  },
  methods: {
    // 退出登录
    handleQuit() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 控制页面切换
    async handlePageChange(page) {
      this.isLoading = true
      await this.getDeviceData(page, this.searchMode, this.searchResultJudgment)
      this.isLoading = false
    },
    // 设备数据搜索
    async getDeviceData(pn = this.daviceDataPn, testMode = 'ALL', resultJudgment = 'ALL', testedBarCode = this.search) {
      this.isLoading=true
      this.tableOptions.page=pn
      const deviceId = this.deviceId
      this.daviceDataPn=pn
      const { data, data: { data: { headers, pageInfo: { list, total }}}} = await this.$axios.get('/deviceData/findDeviceDataByDeviceId',{ params: {
          pn,
          deviceId,
          testMode,
          resultJudgment,
          testedBarCode
        }})
      this.isLoading = false 
      this.deviceDataList = list
      console.log('list', total)
      this.total = total
    },
    // 控制搜索模式切换
    handleModeChange(mode) {
      this.searchMode = mode
      this.getDeviceData(1, this.searchMode, this.searchResultJudgment)
    },
    handleResultJudgmentChange(resultJudgment) {
      this.searchResultJudgment = resultJudgment
      this.getDeviceData(1, this.searchMode, this.searchResultJudgment)
    },
    // 输入触发搜索
    async handleSearch(e) {
      // 对按键作判断，若为无效按键，则不会触发搜索
      if(/^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(e) || e.length === 0) {
        this.getDeviceData(1, this.searchMode, this.searchResultJudgment, this.search)
      }      
    },
  }
}
</script>

<style scoped>

</style>