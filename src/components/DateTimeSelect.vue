<template>
  <div class="q-pa-md">
    <q-date v-model="model" range />
  </div>
  <div class="q-pa-md">
    <div class="q-gutter-sm row">
      <q-input filled v-model="time1" mask="fulltime" :rules="['fulltime']">
        <template v-slot:append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-time
                v-model="time1"
                with-seconds
                format24h
              >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input filled v-model="time2" mask="fulltime" :rules="['fulltime']">
        <template v-slot:append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-time
                v-model="time2"
                with-seconds
                format24h
              >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'DateTimeSelect',
  setup () {
    return {
      model: ref({ from: '2020/07/08', to: '2020/07/17' }),
      time1: ref('10:10:00'),
      time2: ref('10:10:00'),
    }
  }
}
</script>
