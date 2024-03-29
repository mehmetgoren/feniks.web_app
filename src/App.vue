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
import {NodeRepository} from 'src/utils/db';
import {Node} from 'src/utils/entities';

export default defineComponent({
  name: 'App',
  components: {Login},
  setup() {
    const router = useRouter();
    const nodeRepository = new NodeRepository();
    const nodeService = new NodeService();
    const storeService = new StoreService();
    const currentUser = storeService.currentUser;
    const authenticated = ref<boolean>(currentUser.value != null);
    watch(currentUser, (newUser: User | null) => {
      authenticated.value = newUser !== null && !isNullOrEmpty(newUser.token);
      if (authenticated.value) {
        void nodeService.registerWebAppService({app_address:window.location.href});
        void registerUserLogout();
      }
    });

    const addDefaultNodeIfNotExist = async () => {
      if (!await nodeRepository.hasAnyNode()) {
        const hostName = window.location.hostname;
        const node: Node = {node_address: hostName, node_port: 8072, name: hostName, description: 'Default  Node', active: true};
        await nodeRepository.save(node);
      }
    };

    onMounted(async () => {
      await addDefaultNodeIfNotExist();
      storeService.setReadonlyMode(await nodeService.getIsReadOnlyMode());

      await tryLoginByToken();
    });

    const tryLoginByToken= async () => {
      const params = parseQueryString();
      const token = params.token;
      if (token){
        const user: User = await nodeService.loginByToken({token});
        if (user) {
          storeService.setCurrentUser(user);
          await router.push('stream_gallery');
          //to remove token from url
          const newURL = location.href.split('?')[0];
          window.history.pushState('object', document.title, newURL);
        }
      }
    }

    const registerUserLogout = async () => {
      const localService = new LocalService();
      const subscribeService = new SubscribeService(await localService.getNodeIP(), await localService.getNodePort());
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
