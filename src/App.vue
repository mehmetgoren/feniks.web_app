<template>
  <router-view v-if='authenticated'/>
  <Login v-else/>
</template>
<script lang="ts">
import {defineComponent, onMounted, ref, watch} from 'vue';
import Login from 'pages/Login.vue';
import {User} from 'src/utils/models/user_model';
import {isNullOrEmpty, doUserLogout, parseQueryString} from 'src/utils/utils';
import {StoreService} from 'src/utils/services/store_service';
import {SubscribeService} from 'src/utils/services/websocket_services';
import {LocalService} from 'src/utils/services/local_service';
import {useRouter} from 'vue-router';
import {NodeService} from 'src/utils/services/node_service';

export default defineComponent({
  name: 'App',
  components: {Login},
  setup() {
    const router = useRouter();
    const storeService = new StoreService();
    const currentUser = storeService.currentUser;
    const authenticated = ref<boolean>(currentUser.value != null);
    watch(currentUser, (newUser: User | null) => {
      authenticated.value = newUser !== null && !isNullOrEmpty(newUser.token);
      if (authenticated.value) {
        void new NodeService().registerWebAppService({app_address:window.location.href});
        void registerUserLogout();
      }
    });

    onMounted(async () => {
      storeService.setReadonlyMode(await new NodeService().getIsReadOnlyMode());

      await tryLoginByToken();
    });

    const tryLoginByToken= async () => {
      const params = parseQueryString();
      const token = params.token;
      if (token){
        const user: User = await new NodeService().loginByToken({token});
        if (user) {
          storeService.setCurrentUser(user);
          await router.push('stream_gallery');
          //to remove token from url
          const newURL = location.href.split('?')[0];
          window.history.pushState('object', document.title, newURL);
        }
      }
    }

    const registerUserLogout = () => {
      const localService = new LocalService();
      const subscribeService = new SubscribeService();
      subscribeService.subscribeUserLogout((event: MessageEvent) => {
        const userToken = JSON.parse(event.data);
        if (userToken == currentUser.value.token) {
          void doUserLogout(localService, storeService, router);
        }
      });
    }

    return {
      authenticated
    }
  }
})
</script>
