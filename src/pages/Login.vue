<template>
  <div id='q-app'>
    <q-layout v-if='mode < 2' view='lHh Lpr fff'>
      <q-page class='window-height window-width row justify-center items-center' style='background: linear-gradient(#8274C5, #5A4A9F);'>
        <div v-if='mode===0' class='column q-pa-lg'>
          <div class='row'>
            <q-card square class='shadow-24' style='width:310px;height:auto;'>
              <q-card-section class='bg-deep-purple-7'>
                <q-toolbar class='text-primary'>
                  <q-img src='/pheoenix/phoenix(4).png' width='64px' />
                  <q-toolbar-title>
                    <h4 class='text-h5 text-white q-my-md' style='margin-left: 15px'>FENIKS® iVMS</h4>
                  </q-toolbar-title>
                </q-toolbar>
              </q-card-section>
              <q-card-section>
                <q-form class='q-px-sm q-pt-xl'>
                  <q-input square clearable v-model='loginUser.username' type='email' label='Username'
                           lazy-rules :rules="[ val => val && val.length > 0 || 'Please enter username']">
                    <template v-slot:prepend>
                      <q-icon name='person' />
                    </template>
                  </q-input>
                  <q-input square clearable v-model='loginUser.password' type='password' label='Password'
                           lazy-rules :rules="[ val => val && val.length > 0 || 'Please enter password']">
                    <template v-slot:prepend>
                      <q-icon name='lock' />
                    </template>
                  </q-input>
                </q-form>
              </q-card-section>
              <q-card-actions class='q-px-lg'>
                <q-btn unelevated size='lg' color='purple-4' class='full-width text-white' icon='login' label='Login' @click='onLogin' >
                  <q-inner-loading :showing='showLoginLoading' />
                </q-btn>
              </q-card-actions>
              <q-card-section class='text-center q-pa-sm'>
                <p class='text-grey-6' style='cursor: pointer;' @click='onGoRegister'>Register</p>
                <p class='text-grey-6' style='cursor: pointer;' @click='onGoNodes'>Nodes</p>
              </q-card-section>
            </q-card>
          </div>
        </div>
        <div v-else-if='mode===1' class='column q-pa-lg'>
          <div class='row'>
            <q-card square class='shadow-24' style='width:400px;'>
              <q-card-section class='bg-deep-purple-7'>
                <q-toolbar class='text-primary'>
                  <q-img src='/pheoenix/phoenix(4).png' width='64px' />
                  <q-toolbar-title>
                    <h4 class='text-h5 text-white q-my-md' style='margin-left: 15px'>FENIKS® Registration</h4>
                  </q-toolbar-title>
                </q-toolbar>
              </q-card-section>
              <q-card-section>
                <q-form class='q-px-sm q-pt-xl q-pb-lg'>
                  <q-input square clearable v-model='registerUser.email' type='email' label='Email'
                           lazy-rules :rules="[ val => val && val.length > 0 || 'Please enter email']">
                    <template v-slot:prepend>
                      <q-icon name='email' />
                    </template>
                  </q-input>
                  <q-input square clearable v-model='registerUser.username' type='username' label='Username'
                           lazy-rules :rules="[ val => val && val.length > 0 || 'Please enter username']">
                    <template v-slot:prepend>
                      <q-icon name='person' />
                    </template>
                  </q-input>
                  <q-input square clearable v-model='registerUser.password' type='password' label='Password'
                           lazy-rules :rules="[ val => val && val.length > 0 || 'Please enter password']">
                    <template v-slot:prepend>
                      <q-icon name='lock' />
                    </template>
                  </q-input>
                  <q-input square clearable v-model='registerUser.re_password' type='password' label='Re enter password'
                           lazy-rules :rules="[ val => val && val.length > 0 || 'Please re-enter password']">
                    <template v-slot:prepend>
                      <q-icon name='lock' />
                    </template>
                  </q-input>
                </q-form>
              </q-card-section>
              <q-card-actions class='q-px-lg'>
                <q-btn unelevated size='lg' color='purple-4' class='full-width text-white' icon='app_registration' label='Sign me up'
                       @click='onRegister' />
              </q-card-actions>
              <q-card-section class='text-center q-pa-sm'>
                <p class='text-grey-6' style='cursor: pointer;' @click='onReturnLogin'>Return to login</p>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-layout>
    <Nodes v-if='mode===2' @on-go-back='onNodesGoBack'/>
  </div>
</template>

<script lang='ts'>
import { onMounted, ref } from 'vue';
import { LoginUserViewModel, RegisterUserViewModel, User } from 'src/utils/models/user_model';
import { NodeService } from 'src/utils/services/node_service';
import { useQuasar } from 'quasar';
import Nodes from 'src/pages/Nodes.vue';
import { NodeRepository } from 'src/utils/db';
import { useRouter } from 'vue-router';
import { StoreService } from 'src/utils/services/store_service';

export default {
  name: 'Login',
  components:{Nodes},
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const mode = ref<Mode>(Mode.Login);
    const loginUser = ref<LoginUserViewModel>({ username: 'admin', password: 'admin' });
    const registerUser = ref<RegisterUserViewModel>({ email: 'admin@feniks.com', password: 'admin',
      re_password: 'admin', username: 'admin' });
    const nodeService = new NodeService();
    const nodeRepository = new NodeRepository();
    const storeService = new StoreService();
    const showLoginLoading = ref<boolean>(false);

    onMounted(async () => {
      mode.value = await nodeRepository.hasAnyNode() ? Mode.Login : Mode.Nodes;
    });

    const onLogin = async () => {
      showLoginLoading.value = true;
      try {
        const u = loginUser.value;
        if (!u.username || !u.password) {
          $q.notify({message: 'Please enter credentials', color: 'red'});
          return;
        }
        const user: User = await nodeService.login(loginUser.value);
        const token = user?.token;
        if (token && token.length && token.length === 8) {
          storeService.setCurrentUser(user);
          await router.push('node?x=config');
        } else {
          $q.notify({message: 'Username and/or Password are incorrect', color: 'red'});
        }
      }finally {
        showLoginLoading.value = false;
      }
    };

    const onRegister = async () => {
      const u = registerUser.value;
      if (!u.email || !u.username || !u.password || !u.re_password) {
        $q.notify({ message: 'Please enter all fields', color: 'red' });
        return;
      }
      if (u.password !== u.re_password) {
        $q.notify({ message: 'Please enter all fields', color: 'red' });
        return;
      }
      const result = await nodeService.registerUser(u);
      mode.value = result ? Mode.Login : Mode.Register;
    };
    return {
      mode, loginUser, registerUser, showLoginLoading,
      onLogin, onRegister,
      onGoRegister() {
        mode.value = Mode.Register;
      },
      onReturnLogin() {
        mode.value = Mode.Login;
      },
      onGoNodes(){
        mode.value = Mode.Nodes;
      },
      onNodesGoBack(){
        mode.value = Mode.Login;
      }
    };
  }
};

enum Mode {
  Login = 0,
  Register = 1,
  Nodes = 2
}
</script>

<style scoped>

</style>
