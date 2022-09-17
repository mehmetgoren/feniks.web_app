<template>
  <table>
    <tr class="gt-xs">
      <td>
        <q-input :label="labelDate" v-model='selectedDate' mask='YYYY-MM-DD' type='date' filled :dense="dense" :color='color' readonly
                 style='cursor: pointer;width: 155px;' :style="{width:widthDate<1?'155px':widthDate.toString() + 'px'}">
          <q-popup-proxy v-model='showSelectedDate' cover transition-show='scale' transition-hide='scale'>
            <q-date v-model='selectedDate' :color='color' mask='YYYY-MM-DD'>
              <div class='row items-center justify-end q-gutter-sm'>
                <q-btn label='OK' :color='color' flat v-close-popup/>
              </div>
            </q-date>
          </q-popup-proxy>
          <template v-slot:append>
            <q-icon name='event' :color='color'/>
          </template>
        </q-input>
      </td>
      <td v-if='showHour'>
        <q-input :label="labelTime" filled v-model="selectedHour" mask="time" :dense="dense" :color='color' readonly
                 style='margin-left: 5px;width: 100px;cursor: pointer;' :style="{width:widthTime<1?'100px':widthTime.toString() + 'px'}">
          <q-popup-proxy v-model='showSelectedHour' cover transition-show="scale" transition-hide="scale">
            <q-time v-model="selectedHour" format24h :minute-options='minuteOptions' :color='color'>
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" :color='color' flat/>
              </div>
            </q-time>
          </q-popup-proxy>
          <template v-slot:append>
            <q-icon name="access_time" :color='color'/>
          </template>
        </q-input>
      </td>
    </tr>
  </table>
</template>

<script lang='ts'>
import {getCurrentHour, getTodayString, isNullOrEmpty} from 'src/utils/utils';
import {ref, watch} from 'vue';

export default {
  name: 'DateTimeSelector',
  emits: ['date-changed', 'hour-changed', 'date-time-changed'],
  props: {
    color: {
      type: String,
      required: true,
      default: 'primary'
    },
    showHour: {
      type: Boolean,
      default: false
    },
    allowMinuteSelection: {
      type: Boolean,
      default: false
    },
    dense: {
      type: Boolean,
      default: true,
      required: true
    },
    labelDate: {
      type: String,
      default: 'Date'
    },
    labelTime: {
      type: String,
      default: 'Time'
    },
    widthDate: {
      type: Number,
      default: 0
    },
    widthTime: {
      type: Number,
      default: 0
    },
    dateString: {
      type: String,
      default: ''
    },
    timeString: {
      type: String,
      default: ''
    }
  },
  //@ts-ignore
  setup(props: any, {emit}) {
    let dateString = String(props.dateString);
    if (isNullOrEmpty(dateString)) {
      dateString = getTodayString('-');
    }
    let timeString = String(props.timeString);
    if (isNullOrEmpty(timeString)) {
      timeString = getCurrentHour() + ':00';
    }
    const selectedDate = ref<string | null>(dateString);
    const showSelectedDate = ref<boolean>(false);
    const selectedHour = ref<string>(timeString);
    const showSelectedHour = ref<boolean>(false);
    const minuteOptions = ref<number[]>(props.allowMinuteSelection ? [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] : [0]);

    watch(selectedDate, () => {
      const value = selectedDate.value;
      if (!value) {
        return;
      }
      showSelectedDate.value = false;
      if (!props.allowMinuteSelection) {
        //@ts-ignore
        emit('date-changed', value.replaceAll('-', '_'));
      } else {
        emit('date-time-changed', getDateTimeStr());
      }
    });

    watch(selectedHour, () => {
      const value = selectedHour.value;
      if (!value) {
        return;
      }
      if (!props.allowMinuteSelection) {
        showSelectedHour.value = false;
      }
      if (!props.allowMinuteSelection) {
        emit('hour-changed', value.split(':')[0]);
      } else {
        emit('date-time-changed', getDateTimeStr());
      }
    });

    function getDateTimeStr() {
      //@ts-ignore
      return selectedDate.value.replaceAll('-', '_') + '_' + selectedHour.value.replace(':', '_');
    }

    return {
      selectedDate, selectedHour, showSelectedDate, showSelectedHour, minuteOptions
    };
  }
};
</script>

<style scoped>

</style>
