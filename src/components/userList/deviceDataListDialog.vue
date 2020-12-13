<template>
  <div>
    <v-dialog
            v-model="importDialog"
            max-width="800px"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
                color="primary"
                dark
                class="ma-2"
                medium
                v-bind="attrs"
                v-on="on"
        >
          导入
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="headline">导入</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form v-model="valid">
              <v-row>
                <v-col
                        cols="24"
                >
                  <v-file-input
                          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                          label="请选择文件"
                          @change="handleFileChange"
                  ></v-file-input>
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
                  @click="handleImportDeviceData"
          >
            完成
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
            v-model="exportDialog"
            max-width="800px"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
                color="success"
                dark
                class="ma-2"
                medium
                v-bind="attrs"
                v-on="on"
        >
          导出
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="headline">导出</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form v-model="valid">
              <v-row>
                <v-col
                        cols="4"
                >
                  <v-switch
                          v-model="isNeedBarCode"
                          label="展示SN条码"
                  ></v-switch>
                </v-col>
                <v-col
                        cols="4"
                >
                  <v-switch
                          v-model="isNeedBeatOutput"
                          label="展示节拍输出"
                  ></v-switch>
                </v-col>
                <v-col
                        cols="4"
                >
                  <v-select
                          :items="fileFormatItems"
                          hide-details
                          label="选择模式"
                          v-model="fileFormat"
                          :rules="rules"
                  ></v-select>
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
                  @click="handleExportDeviceData"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
            v-model="addDialog"
            max-width="800px"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
                color="deep-purple darken-1"
                dark
                class="ma-2"
                medium
                v-bind="attrs"
                v-on="on"
        >
          添加
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="headline">添加</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form v-model="valid">
              <v-row>
                <v-col
                        cols="6"
                >
                  <v-select
                          :items="modeItems"
                          hide-details
                          label="选择模式"
                          v-model="mode"
                          @change="getAddHeaders"
                          :rules="rules"
                  ></v-select>
                </v-col>
                <v-col
                        cols="6"
                >
                  <v-select
                          :items="resultJudgmentItems"
                          hide-details
                          label="选择结果"
                          v-model="resultJudgment"
                          @change="getAddHeaders"
                          :rules="rules"
                  ></v-select>
                </v-col>
              </v-row>
              <v-row >
                <v-col
                        cols="6"
                        v-for="(item, index) in addOptions"
                >
                  <v-text-field
                          v-model="item.value"
                          :label="item.label"
                          hide-details
                          :rules="rules"
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
                  @click="handleAddDeviceData"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  export default {
    name: "deviceDataListDialog",
    props: {
      currentUserId: {
        type: Number,
        require
      },
      currentDeviceId: {
        type: Number,
        require
      }
    },
    data: () => ({
      isNeedBarCode: true,
      isNeedBeatOutput: true,

      // mode Item
      fileFormatItems: ['csv', 'xls'],
      modeItems: ['PLR', 'PDL', 'CPDL', 'OCC', 'VXXX', 'MFR'],
      resultJudgmentItems: ['Accept', 'Reject'],
      mode: '',
      resultJudgment: '',
      fileFormat: 'xls',
      addOptions: [],
      importDialog: false,
      exportDialog: false,
      addDialog: false,
      // 添加用户 - 表单是否验证
      valid: false,
      // 添加用户数据格式
      addDeviceItem: {
        deviceNumber: '',
        deviceName: '',
        message: ''
      },
      rules: [
        value => !!value || '必填',
        value => (value || '').length <= 20 || '长度不应超过 20 个字符',
      ],
    }),

    watch: {
      addDialog(val) {
        if (val) {
          this.mode = ''
          this.resultJudgment = ''
          this.$axios.get('/deviceData/getResultJudgments')
          .then(({data}) => {
            // 表头
            const resultJudgmentItems = data.data
            console.log('index', resultJudgmentItems.indexOf('ALL'))
            resultJudgmentItems.splice(resultJudgmentItems.indexOf('ALL'), 1)
            console.log('items', resultJudgmentItems)
            this.resultJudgmentItems = data.data
          })
          .catch(err => {
            console.log('err', err)
          })
        } else {
          this.addOptions = []
          this.closeAddDialog()
        }
      },
    },
    methods: {
      // Dialog 控制层
      closeAddDialog () {
        this.addDialog = false
      },
      async getAddHeaders() {
        this.addOptions = []
        const resultJudgment = this.resultJudgment
        const testMode = this.mode
        if (!resultJudgment || !testMode) {
          return
        }
        const { data: { data }} = await this.$axios.get('/deviceData/getDataItemHeaders', {
          params: {
            resultJudgment,
            testMode
          }
        })
        if (data) {
          for (let item of data) {
            item.value = ''
          }
          this.addOptions = data
          this.addOptions.unshift(
            {
              label: '组号',
              prop: 'groupId',
              value: ''
            }, {
              label: '节拍输出',
              prop: 'beatOutput',
              value: ''
            }, {
              label: '运行次数',
              prop: 'runNumber',
              value: ''
            }, {
              label: '被测条形码',
              prop: 'testedBarCode',
              value: ''
            })
        } else {
          this.addOptions = []
        }
      },
      async handleAddDeviceData() {

        if (!this.valid) {
          this.$emit('showSnackbar', '请正确填写信息')
          return
        }
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1
        const day = now.getDate()
        const hour = now.getHours()
        const minutes = now.getMinutes()
        const seconds = now.getSeconds()
        const date = `${year}-${month}-${day}`
        const time = `${hour}:${minutes}:${seconds}`

        const testMode = this.mode
        const resultJudgment = this.resultJudgment
        const deviceId = this.currentDeviceId
        const form = {
          date,
          time,
          testMode,
          resultJudgment,
          deviceId
        }
        for (let item of this.addOptions) {
          form[item.prop] = item.value
        }
        const { data: {code, message} } = await this.$axios.post('/deviceData/addDeviceData', form)
        this.$emit('showSnackbar', message)
        this.$emit('updateDeviceData')
        this.closeAddDialog()
      },
      async handleExportDeviceData() {
        const deviceId = this.currentDeviceId
        const isNeedBarCode = this.isNeedBarCode
        const isNeedBeatOutput = this.isNeedBeatOutput
        this.$axios.get("deviceData/exportDeviceData", {
          params: {
            deviceId,
            isNeedBarCode,					//导出excel是否要包含SN条码
            isNeedBeatOutput,				//导出excel是否要包含测试节拍输出
            exportType: this.fileFormat
          },
          headers: {'Content-type': 'application/json'},
          responseType: 'arraybuffer'
        }).then(res => {
          // 创建Blob对象，设置文件类型
          let blob = new Blob([res.data], {type: "application/vnd.ms-excel"});
          let url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.style.display = 'none';
          link.href = url;
          link.download = `导出文件.${this.fileFormat}`// 自定义文件名
          link.click();// 下载文件
          // URL.revokeObjectURL(url); // 释放内存
        }).catch(err => {
          this.$emit('showSnackbar', '导出失败')
        })
      },
      handleFileChange(file) {
        this.file = file
      },
      async handleImportDeviceData() {
        const file = this.file
        console.log('file', file)
        const formData = new FormData();
        formData.append('uploadExcel', file)
        formData.append('deviceId', this.currentDeviceId)
        this.$axios({method: 'post', url: '/deviceData/importDeviceData',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }).then(res => {
          const { data: {code, message}} = res
            if (!code) {
              this.$emit('updateDeviceData')
              this.$emit('showSnackbar', message)
            }
          }
        ).catch(err => {
          this.$emit('showSnackbar', '导入失败')
        })
        this.importDialog = false
      }
    }
  }
</script>

<style scoped>

</style>
