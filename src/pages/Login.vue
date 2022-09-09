<template>
  <div id='q-app'>
    <q-layout v-if='mode < 2' view='lHh Lpr fff'>
      <q-page class='window-height window-width row justify-center items-center' style='background: linear-gradient(#8274C5, #5A4A9F);'>
        <div v-if='mode===0' class='column q-pa-lg'>
          <div class='row'>
            <q-card square class='shadow-24' style='width:310px;height:auto;'>
              <q-card-section class='bg-deep-purple-7'>
                <q-toolbar class='text-primary'>
                  <q-img src='/pheoenix/phoenix.png' width='64px' no-spinner no-transition />
                  <q-toolbar-title>
                    <h4 class='text-h5 text-white q-my-md' style='margin-left: 15px'>FENIKS® iVMS</h4>
                  </q-toolbar-title>
                </q-toolbar>
              </q-card-section>
              <q-card-section>
                <q-form class='q-px-sm q-pt-xl' style="margin-top: -40px;">
                  <q-select v-model="locale" :options="localeOptions" :label="$t('language')"
                            square  dense borderless emit-value map-options options-dense style="min-width: 150px">
                    <template v-slot:prepend>
                      <q-icon name='language' style="margin-right: 5px;" />
                    </template>
                  </q-select>
                  <q-space style="margin-bottom: 5px" />
                  <q-input square clearable v-model='loginUser.username' type='email' :label="$t('username')"
                           lazy-rules :rules="[ val => val && val.length > 0 || $t('venterusername')]">
                    <template v-slot:prepend>
                      <q-icon name='person' />
                    </template>
                  </q-input>
                  <q-input square clearable v-model='loginUser.password' type='password' :label="$t('password')"
                           lazy-rules :rules="[ val => val && val.length > 0 || $t('venterpassword')]">
                    <template v-slot:prepend>
                      <q-icon name='lock' />
                    </template>
                  </q-input>
                </q-form>
              </q-card-section>
              <q-card-actions class='q-px-lg'>
                <q-btn unelevated size='lg' color='purple-4' class='full-width text-white' icon='login' :label="$t('login')" @click='onLogin'
                :disable="showLoginLoading">
                  <q-inner-loading :showing='showLoginLoading' />
                </q-btn>
              </q-card-actions>
              <q-card-section class='text-center q-pa-sm'>
                <p class='text-grey-6' style='cursor: pointer;' @click='onGoRegister'>{{$t('register')}}</p>
                <p class='text-grey-6' style='cursor: pointer;' @click='onGoNodes'>{{$t('nodes')}}</p>
              </q-card-section>
            </q-card>
          </div>
        </div>
        <div v-else-if='mode===1' class='column q-pa-lg'>
          <div class='row'>
            <q-card square class='shadow-24' style='width:400px;'>
              <q-card-section class='bg-deep-purple-7'>
                <q-toolbar class='text-primary'>
                  <q-img src='/pheoenix/phoenix.png' width='64px' no-spinner no-transition />
                  <q-toolbar-title>
                    <h4 class='text-h5 text-white q-my-md' style='margin-left: 15px'>FENIKS® Registration</h4>
                  </q-toolbar-title>
                </q-toolbar>
              </q-card-section>
              <q-card-section>
                <q-form class='q-px-sm q-pt-xl q-pb-lg'>
                  <q-input square clearable v-model='registerUser.email' type='email' :label="$t('email')"
                           lazy-rules :rules="[ val => val && val.length > 0 || $t('venteremail')]">
                    <template v-slot:prepend>
                      <q-icon name='email' />
                    </template>
                  </q-input>
                  <q-input square clearable v-model='registerUser.username' type='username' :label="$t('username')"
                           lazy-rules :rules="[ val => val && val.length > 0 || $t('venterusername')]">
                    <template v-slot:prepend>
                      <q-icon name='person' />
                    </template>
                  </q-input>
                  <q-input square clearable v-model='registerUser.password' type='password' :label="$t('password')"
                           lazy-rules :rules="[ val => val && val.length > 0 || $t('venterpassword')]">
                    <template v-slot:prepend>
                      <q-icon name='lock' />
                    </template>
                  </q-input>
                  <q-input square clearable v-model='registerUser.re_password' type='password' :label="$t('reenterpassword')"
                           lazy-rules :rules="[ val => val && val.length > 0 || $t('vreenterpassword')]">
                    <template v-slot:prepend>
                      <q-icon name='lock' />
                    </template>
                  </q-input>
                </q-form>
              </q-card-section>
              <q-card-actions class='q-px-lg'>
                <q-btn unelevated size='lg' color='purple-4' class='full-width text-white' icon='app_registration' :label="$t('signmeup')"
                       @click='onRegister' />
              </q-card-actions>
              <q-card-section class='text-center q-pa-sm'>
                <p class='text-grey-6' style='cursor: pointer;' @click='onReturnLogin'>{{$t('returntologin')}}</p>
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
import {onMounted, ref, watch} from 'vue';
import { LoginUserViewModel, RegisterUserViewModel, User } from 'src/utils/models/user_model';
import { NodeService } from 'src/utils/services/node_service';
import { useQuasar } from 'quasar';
import Nodes from 'src/pages/Nodes.vue';
import { NodeRepository } from 'src/utils/db';
import { useRouter } from 'vue-router';
import { StoreService } from 'src/utils/services/store_service';
import {useI18n} from 'vue-i18n';

export default {
  name: 'Login',
  components:{Nodes},
  setup() {
    const { locale } = useI18n({ useScope: 'global' })
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

    watch(locale, newValue => {
      nodeService.LocalService.setLang(<any>newValue);
    });

    onMounted(async () => {
      let localeTemp: any = nodeService.LocalService.getLang();
      if (!localeTemp){
        localeTemp = $q.lang.getLocale();
        nodeService.LocalService.setLang(localeTemp)
      }
      locale.value = localeTemp;
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
          await router.push('node_conf');
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
      locale,
      localeOptions: [
        { value: 'en-US', label: 'English' },
        { value: 'tr-TR', label: 'Türkçe' }
      ],
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
