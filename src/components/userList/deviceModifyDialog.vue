<template>
  <v-dialog
          v-model="addDeviceDialog"
          max-width="800px"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-icon
              class="mr-2"
              v-bind="attrs"
              v-on="on"
              @click="handleDeviceModify"
      >
        mdi-cog
      </v-icon>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">设备信息修改</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-form v-model="valid">
            <v-row>
              <v-col
                      cols="24"
              >
                <v-text-field
                        v-model="deviceItem.deviceNumber"
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
                        v-model="deviceItem.deviceName"
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
                        v-model="deviceItem.message"
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
                @click="handleModifyDevice"
        >
          确认
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    name: "deviceModifyDialog",
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
      deviceItem: {},
      rules: {
        deviceNumber: [
          value => (value && value.length >= 1 && value.length <= 32) || '字符长度为 1~32',
          value => !(/[^a-zA-Z0-9_]/.exec(value)) || '可使用数字、英文、下划线，不能包括特殊符号'
        ],
        deviceName: [
          value => (value && value.length >= 1 && value.length <= 32) || '字符长度为 1~32',
        ],
        message: [
          value => (value && value.length >= 1 && value.length <= 24) || '字符长度为 1~24',
        ]
      },
    }),
    props:["deviceMsg"],
    watch: {
      addDeviceDialog(val) {
        val || this.closeAddDeviceDialog()
      },
    },
    methods: {
      handleDeviceModify(){
        let a = Object.assign({}, this.deviceMsg)
        this.deviceItem=a
        
      },
      // Dialog 控制层
      closeAddDeviceDialog () {
        this.addDeviceDialog = false
      },
      async handleModifyDevice() {
        if (!this.valid) {
          this.$emit('showSnackbar', '请正确填写信息')
          return
        }
        const deviceItem = this.deviceItem
        console.log('1111',deviceItem);
        const { data: {code}} = await this.$axios.post('device/updateDevice', deviceItem)
        !code && this.$emit('showSnackbar', '修改成功')
        this.$emit('updateDevice')
        this.closeAddDeviceDialog()
      },
    }
  }
</script>

<style scoped>

</style>
