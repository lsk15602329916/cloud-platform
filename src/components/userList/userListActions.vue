<template>
  <div>
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
  </div>
</template>

<script>
  export default {
    name: "userListActions"
  }
</script>

<style scoped>

</style>
