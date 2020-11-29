<template>
  <v-dialog
          v-model="addDeviceDialog"
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
        新增设备
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">新增设备</span>
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
                        label="设备型号"
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
                @click="closeAddDeviceDialog"
        >
          取消
        </v-btn>
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
</template>

<script>
  export default {
    name: "userListDialog",
    props: {
      currentUserId: {
        type: Number,
        require
      }
    },
    data: () => ({
      deviceList: [],
      addDeviceDialog: false,
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
      addDeviceDialog(val) {
        val || this.closeAddDeviceDialog()
      },
    },
    methods: {
      // Dialog 控制层
      closeAddDeviceDialog () {
        this.addDeviceDialog = false
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
    }
  }
</script>

<style scoped>

</style>
