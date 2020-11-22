<template>
  <v-main>
    <v-card>
      <v-list two-line dense>
        <v-list-item>
          <v-list-item-icon>
            <v-icon color="indigo">
              mdi-account
            </v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>用户编号</v-list-item-title>
            <v-list-item-subtitle>GZ-20201111</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-action></v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>登录账号</v-list-item-title>
            <v-list-item-subtitle>GZ-H20001</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-for="(item, index) in information" dense :key="'i' + index">
          <v-list-item-icon>
            <v-icon color="indigo">
              {{ item.icon }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-text-field
                    :label="item.label"
                    :rules="item.rules"
                    v-model="item.value"
            ></v-text-field>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-for="(item, index) in reservedInformation" dense :key="'r' + index">
          <v-list-item-icon>
            <v-icon color="indigo">
              {{ index ? '' : 'mdi-view-dashboard' }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-text-field
                    :label="'预留信息' + (index+1)"
                    v-model="item[index]"
            ></v-text-field>
          </v-list-item-content>
        </v-list-item>

        <v-btn
                color="info"
                block
                @click="addReservedInformation"
        >
          新增预留信息
        </v-btn>
      </v-list>
    </v-card>
  </v-main>
</template>

<script>
  export default {
    name: "AccountInformation",
    data() {
      return {
        information: [
          {
          label: '客户名称', icon: 'mdi-account-box', key:'customerName', value: '', rules: [
            value => !!value || '必填',
            value => (value && value.length >= 3) || '最小长度为3',]
          },
          {
            label: '联系人', icon: 'mdi-account-details', key:'contacts', value: '', rules: [
              value => !!value || '必填',
              value => (value && value.length >= 3) || '最小长度为3',]
          },
          {
            label: '联系电话', icon: 'mdi-cellphone', key:'contactNumber', value: '', rules: [
              value => !!value || '必填',
              value => (value && /^1[3456789]\d{9}$/.test(value)) || '请输入正确的电话号码',]
          },
          {
            label: '地址', icon: 'mdi-map-marker', key:'address', value: '', rules: [
              value => !!value || '必填',
              value => (value && value.length >= 3) || '最小长度为3',]
          },
          {
            label: '备注', icon: 'mdi-view-dashboard', key:'remarks', value: '', rules: [
              value => !!value || '必填',
              value => (value && value.length >= 3) || '最小长度为3',]
          }
        ],
        reservedInformation: []
      }
    },
    methods: {
      addReservedInformation() {
        if ( this.reservedInformation.length < 8) {
          this.reservedInformation.push('')
        }
      }
    }
  }
</script>

<style scoped>

</style>
