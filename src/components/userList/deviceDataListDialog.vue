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
                  <v-text-field
                          v-model="addDeviceItem.deviceNumber"
                          label="设备编号"
                          :rules="rules.deviceNumber"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col
                        cols="24"
                >
                  <v-text-field
                          v-model="addDeviceItem.deviceName"
                          label="设备名称"
                          :rules="rules.deviceName"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col
                        cols="24"
                >
                  <v-text-field
                          v-model="addDeviceItem.message"
                          label="有关信息"
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
                  @click="handleAddDevice"
          >
            确认
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
                        cols="24"
                >
                  <v-text-field
                          v-model="addDeviceItem.deviceNumber"
                          label="设备编号"
                          :rules="rules.deviceNumber"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col
                        cols="24"
                >
                  <v-text-field
                          v-model="addDeviceItem.deviceName"
                          label="设备名称"
                          :rules="rules.deviceName"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col
                        cols="24"
                >
                  <v-text-field
                          v-model="addDeviceItem.message"
                          label="有关信息"
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
                  @click="handleAddDevice"
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
                        cols="24"
                >
                  <v-select
                          :items="modeItems"
                          hide-details
                          label="选择模式"
                          v-model="mode"
                          @change="getAddHeaders"
                  ></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col
                        cols="24"
                >
                  <v-select
                          :items="resultJudgmentItems"
                          hide-details
                          label="选择结果"
                          v-model="resultJudgment"
                          @change="getAddHeaders"
                  ></v-select>
                </v-col>
              </v-row>
              <v-row justify="center">.
                <v-col
                        cols="12"
                >
                  <v-menu
                          ref="menu"
                          v-model="isMenuShow"
                          :close-on-content-click="false"
                          :nudge-right="40"
                          :return-value.sync="time"
                          transition="scale-transition"
                          offset-y
                          max-width="290px"
                          min-width="290px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                              v-model="time"
                              label="时期"
                              prepend-icon="mdi-clock-time-four-outline"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                      ></v-text-field>
                    </template>
                    <v-time-picker
                            v-if="isMenuShow"
                            v-model="time"
                            full-width
                            format="24hr"
                            use-seconds
                            @click:minute="$refs.menu.save(time)"
                    ></v-time-picker>
                  </v-menu>
                </v-col>
              </v-row>
              <v-row  v-for="(item, index) in addOptions">
                <v-col
                        cols="24"
                >
                  <v-text-field
                          v-model="item.value"
                          :label="item.label"
                          hide-details
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
                  @click="handleAddDevice"
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
      }
    },
    data: () => ({
      time: null,
      isMenuShow: false,
      // mode Item
      modeItems: ['PLR', 'PDL', 'CPDL', 'OCC', 'VXXX', 'MFR'],
      resultJudgmentItems: ['Accept', 'Reject'],
      mode: '',
      resultJudgment: '',
      addOptions: [],
      deviceList: [],
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
      rules: {
        deviceNumber: [
          value => (value && value.length >= 1 && value.length <= 32) || '字符长度为 1~32',
          value => !(/[^a-zA-Z0-9_]/.exec(value)) || '可使用数字、英文、下划线，不能包括特殊符号'
        ],
        deviceName: [
          value => (value && value.length >= 1 && value.length <= 32) || '字符长度为 1~32',
          value => !(/[^a-zA-Z0-9_]/.exec(value)) || '可使用数字、英文、下划线，不能包括特殊符号'
        ],
        message: [
          value => (value && value.length >= 1 && value.length <= 24) || '字符长度为 1~24',
          value => !(/[^a-zA-Z0-9]/.exec(value)) || '需使用数字、英文，不能使用特殊符号'
        ]
      },
    }),
    watch: {
      addDialog(val) {
        if (val) {
          this.mode = ''
          this.resultJudgment = ''
          this.$axios.get('/deviceData/getResultJudgments')
          .then(({data}) => {
            // 表头
            this.resultJudgmentItems = data.data
          })
          .catch(err => {
            console.log('err', err)
          })
        } else {
          this.closeAddDialog()
        }
      },
    },
    async mounted() {
    },
    methods: {
      // Dialog 控制层
      closeAddDialog () {
        this.addDialog = false
      },
      async handleAddDevice() {
        if (!this.valid) {
          this.$emit('showSnackbar', '请正确填写信息')
          return
        }
        const { deviceNumber, deviceName, message } = this.addDeviceItem
        const { data: {code}} = await this.$axios.post('/device/addDevice', {
          userId: this.currentUserId,
          deviceNumber,
          deviceName,
          message
        })
        !code && this.$emit('showSnackbar', '添加成功')
        this.$emit('updateDevice')
        this.closeAddDeviceDialog()
      },
      async getAddHeaders() {
        this.addOptions = [
          {
          label: '组号',
          prop: 'groupId',
          value: ''
          },
          {
            label: '日期',
            prop: 'date',
            value: ''
          },
          {
            label: '时间',
            prop: 'time',
            value: ''
          },
          {
            label: '运行次数',
            prop: 'runNumber',
            value: ''
          },
          {
            label: '被测试条码',
            prop: 'testedBarCode',
            value: ''
          },
          {
            label: '节拍输出',
            prop: 'beatOutput',
            value: ''
          },
        ]
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
        } else {
          this.addOptions = []
        }
        console.log('dat啊手动阀手动阀a', this.addOptions)
      },
    }
  }
</script>

<style scoped>

</style>
