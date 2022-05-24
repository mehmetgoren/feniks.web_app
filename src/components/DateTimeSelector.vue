<template>
  <q-input v-model='selectedDate' mask='YYYY-MM-DD' type='date' filled dense :color='color' readonly style='cursor: pointer;'>
    <q-popup-proxy v-model='showSelectedDate' cover transition-show='scale' transition-hide='scale'>
      <q-date v-model='selectedDate' :color='color' mask='YYYY-MM-DD'>
        <div class='row items-center justify-end q-gutter-sm'>
          <q-btn label='OK' :color='color' flat v-close-popup />
        </div>
      </q-date>
    </q-popup-proxy>
    <template v-slot:append>
      <q-icon name='event' :color='color' />
    </template>
  </q-input>

  <q-input v-if='showHour' filled v-model="selectedHour" mask="time" dense :color='color' readonly style='margin-left: 5px;width: 100px;cursor: pointer;'>
    <q-popup-proxy v-model='showSelectedHour' cover transition-show="scale" transition-hide="scale">
      <q-time v-model="selectedHour" format24h :minute-options='[0]' :color='color'>
        <div class="row items-center justify-end">
          <q-btn v-close-popup label="Close" :color='color' flat  />
        </div>
      </q-time>
    </q-popup-proxy>
    <template v-slot:append>
      <q-icon name="access_time" :color='color' />
    </template>
  </q-input>

</template>

<script lang='ts'>
import { getCurrentHour, getTodayString } from 'src/utils/utils';
import { ref, watch } from 'vue';

export default {
  name: 'DateTimeSelector',
  emits: ['date-changed', 'hour-changed'],
  props: {
    color: {
      type: String,
      required: true,
      default: 'primary'
    },
    showHour:{
      type:Boolean,
      default: false
    }
  },
  //@ts-ignore
  setup(props: any, { emit }) {
    const selectedDate = ref<string | null>(getTodayString('-'));
    const showSelectedDate = ref<boolean>(false);

    const selectedHour = ref<string>(getCurrentHour() + ':00');
    const showSelectedHour = ref<boolean>(false);

    watch(selectedDate, () => {
      const value = selectedDate.value;
      if (!value) {
        return;
      }
      showSelectedDate.value = false;
      //@ts-ignore
      emit('date-changed', value.replaceAll('-', '_'));
    });

    watch(selectedHour, () => {
      const value = selectedHour.value;
      if (!value) {
        return;
      }
      showSelectedHour.value = false;
      //@ts-ignore
      emit('hour-changed', value.split(':')[0]);
    });

    return {
      selectedDate, selectedHour, showSelectedDate, showSelectedHour
    };
  }
};
</script>

<style scoped>

</style>