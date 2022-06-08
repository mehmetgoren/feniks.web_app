<template>
  <router-view v-if='authenticated' />
  <Login v-else />
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import Login from 'pages/Login.vue';
import { useStore } from 'src/store';
import { User } from 'src/utils/models/user_model';
import { isNullOrEmpty } from 'src/utils/utils';

export default defineComponent({
  name: 'App',
  components: { Login },
  setup(){
    const $store = useStore();
    const currentUser = computed(() => $store.getters['settings/currentUser']);
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
