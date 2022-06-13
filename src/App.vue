<template>
  <router-view v-if='authenticated' />
  <Login v-else />
</template>
<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import Login from 'pages/Login.vue';
import { User } from 'src/utils/models/user_model';
import { isNullOrEmpty } from 'src/utils/utils';
import { StoreService } from 'src/utils/services/store_service';

export default defineComponent({
  name: 'App',
  components: { Login },
  setup(){
    const storeService = new StoreService();
    const currentUser = storeService.currentUser;
    const authenticated = ref<boolean>(currentUser.value != null);
    watch(currentUser, (newUser: User | null) => {
      authenticated.value = newUser !== null && !isNullOrEmpty(newUser.token);
    });

    return {
      authenticated
    }
  }
})
</script>
