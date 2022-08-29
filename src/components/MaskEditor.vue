<template>
  <q-space style='margin-top: 10px;'></q-space>
  <div v-if='odModel?.id' class='absolute' :style="{width: width + 'px', height: height + 'px'}" @click='handleClick'>
    <div :class="{'alerts-border': (selected?.id?.length??0)>0}" :style="{width: (width + 10) + 'px', height: (height + 10)+ 'px'}">
      <q-img id='img-mask-editor' alt='no image' :width='width + "px"' :height='height + "px"' :src="'data:image/png;base64, ' + base64Image"/>
      <div class='absolute inset-0 right-0 bottom-0' style='inset: -20px;'>
        <div v-for='(dot, index) in selected.dots' :key='index' :id="'dotDiv' + index" class='bg-gray-900 rounded-full absolute z-20' draggable='true'
             @contextmenu='handleRightClick(dot, $event)'
             :style='dot' @dragstart='handleDragStart(dot, $event)' @dragend='handleDragEnd(dot, $event)' @drag='handleDragging(dot, $event)'/>
        <div class='absolute inset-0 right-0 bottom-0'></div>
        <svg width='100%' height='100%' class='absolute pointer-events-none' style='inset: 20px;'>
          <g>
            <polyline :points='selected.coordinates' fill='rgba(244,0,0,0.5)'></polyline>
          </g>
        </svg>
      </div>
      <q-inner-loading v-if='loadingObject' :showing='true'>
        <q-spinner size='25%' color='amber'/>
      </q-inner-loading>
    </div>
        <q-space style='margin: 5px;'></q-space>
    <div>
      <q-tabs v-model='tab' narrow-indicator dense align='justify' class='bg-grey-1' @update:model-value='onTabsChanged'>
        <q-tab class='text-orange' name='zones' icon='format_shapes' label='Zones'/>
        <q-tab class='text-accent' name='masks' icon='block' label='Masks'/>
      </q-tabs>
      <div v-if='tab==="zones"'>
        <q-table title='Zones' :rows='zonesService.points' :columns='columns' row-key='id' selection='single'
                 v-model:selected='zonesService.tableSelected' @selection='onTableSelected' icon-first-page='format_shapes'>
          <template v-slot:top-left>
            <div class='row'>
              <q-btn label='Add Zone' icon-right='add' color='orange' @click='onAdd'></q-btn>
            </div>
          </template>
          <template v-slot:top-right>
            <div class='row'>
              <q-btn label='Take a screenshot' icon-right='photo_camera' color='orange' @click='onTakeScreenshot' :disable="loadingObject">
                <q-inner-loading :showing='loadingObject'/>
              </q-btn>
            </div>
          </template>
          <template v-slot:body-cell-delete='props'>
            <q-td :props='props'>
              <div>
                <q-btn round color='deep-orange' icon='delete' @click='onDelete(props.row)'/>
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
      <div v-if='tab==="masks"'>
        <q-table title='Masks' :rows='masksService.points' :columns='columns' row-key='id' selection='single'
                 v-model:selected='masksService.tableSelected' @selection='onTableSelected' icon-first-page='format_shapes'>
          <template v-slot:top-left>
            <div class='row'>
              <q-btn label='Add Mask' icon-right='add' color='accent' @click='onAdd'></q-btn>
            </div>
          </template>
          <template v-slot:top-right>
            <div class='row'>
              <q-btn label='Take a screenshot' icon-right='photo_camera' color='accent' @click='onTakeScreenshot' :disable="loadingObject">
                <q-inner-loading :showing='loadingObject'/>
              </q-btn>
            </div>
          </template>
          <template v-slot:body-cell-delete='props'>
            <q-td :props='props'>
              <div>
                <q-btn round color='deep-orange' icon='delete' @click='onDelete(props.row)'/>
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
    <q-input color='grey-3' label-color='orange' v-model='selected.coordinates' label='Zone Coordinates' readonly>
      <template v-slot:prepend>
        <q-icon name='format_shapes' color='amber'/>
      </template>
    </q-input>
  </div>
  <div v-else>
    <label class='blink_me'>AI Snapshot is not available. Please enabled it first by editing from source settings.</label>
  </div>
</template>

<script lang='ts'>
import {nextTick, onBeforeUnmount, onMounted, ref} from 'vue';
import {SourceModel} from 'src/utils/models/source_model';
import {NodeService} from 'src/utils/services/node_service';
import {PublishService, SubscribeService} from 'src/utils/services/websocket_services';
import {EditorImageResponseModel} from 'src/utils/entities';
import {WsConnection} from 'src/utils/ws/connection';
import {createEmptyBase64Image, deepCopy, isNullOrEmpty} from 'src/utils/utils';
import {nanoid} from 'nanoid';
import {List} from 'linqts';

export default {
  name: 'MaskEditor',
  props: {
    odModel: {
      type: Object,
      required: true
    },
    separator: {
      type: String,
      required: true
    }
  },
  emits: ['zones-coordinates-changed', 'masks-coordinates-changed'],
  //@ts-ignore
  setup(props: any, {emit}) {
    const nodeService = new NodeService();
    const publishService = new PublishService();
    const localService = nodeService.LocalService;
    const source = ref<SourceModel>(localService.createEmptySource());
    const width = ref<number>(1280);
    const height = ref<number>(720);
    let snapshotWidth = 0;
    let snapshotHeight = 0;

    const emptyViewModel: ViewModel = {id: '', dots: [], coordinates: ''};
    const selected = ref<ViewModel>({...emptyViewModel});

    const zonesService = ref<WrapperService>(new WrapperService('zones-coordinates-changed', emit, props.separator,
      width.value, height.value, (v) => selected.value = v));
    zonesService.value.setSelected(selected.value);

    const masksService = ref<WrapperService>(new WrapperService('masks-coordinates-changed', emit, props.separator,
      width.value, height.value, (v) => selected.value = v));

    const drawService = new DrawService(width.value, height.value);
    let connTakeScreenshot: WsConnection | null = null;
    const base64Image = ref<string>(createEmptyBase64Image());
    const loadingObject = ref<boolean>(false);
    const maskScreenshotType = 3;
    const containerRect: React = {x1: 0, y1: 0, x2: 0, y2: 0, bias: 0};
    const tab = ref<string>('zones');

    const takeScreenshot = async () => {
      const s = source.value;
      await publishService.publishEditor({
        id: s.id,
        brand: s.brand,
        name: s.name,
        address: s.address,
        event_type: maskScreenshotType
      });
      loadingObject.value = true;
    };

    onMounted(async () => {
      const sourceId = props.odModel?.id;
      if (isNullOrEmpty(sourceId)) {
        return;
      }
      const nodeIp = await localService.getNodeIP();
      const nodePort = await localService.getNodePort();
      const subscribeService = new SubscribeService(nodeIp, nodePort);

      source.value = await nodeService.getSource(sourceId);

      snapshotWidth = <number>source.value.snapshot_width;
      snapshotHeight = <number>source.value.snapshot_height;

      zonesService.value.unmarshalPoints(props.odModel.zones_list);
      masksService.value.unmarshalPoints(props.odModel.masks_list);

      connTakeScreenshot = subscribeService.subscribeEditor('me', (event: MessageEvent) => {
        try {
          const responseModel: EditorImageResponseModel = JSON.parse(event.data);
          if (responseModel.id !== sourceId || responseModel.event_type != maskScreenshotType) {
            return;
          }
          base64Image.value = responseModel.image_base64;
          localService.saveScreenshot(sourceId, responseModel.image_base64);
        } finally {
          loadingObject.value = false;
        }
      });
      const base64Img = localService.getScreenshot(sourceId);
      if (base64Img) {
        base64Image.value = base64Img;
      } else {
        await takeScreenshot();
      }

      await nextTick();
      const img = <any>document.getElementById('img-mask-editor');
      const rect = img.getBoundingClientRect();
      containerRect.x1 = rect.left + containerRect.bias;
      containerRect.y1 = rect.top + containerRect.bias;
      containerRect.x2 = rect.right + containerRect.bias;
      containerRect.y2 = rect.bottom + containerRect.bias;
    });

    onBeforeUnmount(() => {
      if (connTakeScreenshot) {
        connTakeScreenshot.close();
      }
    });

    function handleClick(e: any) {
      if (selected.value.id.length === 0) {
        return;
      }
      if (!isInArea(e.x, e.y)) {
        return;
      }
      e.stopPropagation();
      e.preventDefault();
      selected.value.dots.push(drawService.createDot(e));
      onUpdateList();
    }

    function handleRightClick(dot: Dot, e: any) {
      if (selected.value.id.length === 0) {
        return;
      }
      e.preventDefault();
      const index = selected.value.dots.findIndex(x => x.id == dot.id);
      if (index > -1) {
        selected.value.dots.splice(index, 1);
      }
    }

    function handleDragStart(dot: Dot, e: any) {
      e.dataTransfer.effectAllowed = true;
      e.dataTransfer.setData('text', e.target.id);
      e.dataTransfer.effectAllowed = 'move';
      dot.opacity = 0.;
    }

    function handleDragEnd(dot: Dot, e: any) {
      const {x, y} = fixCoor(e.x, e.y);
      dot.opacity = 1.;
      drawService.editDot(dot, x - containerRect.x1, y - containerRect.y1);
      onUpdateList();
    }

    function handleDragging(dot: Dot, e: any) {
      if (selected.value.id.length === 0) {
        return;
      }
      const {x, y} = fixCoor(e.x, e.y);
      drawService.editDot(dot, x - containerRect.x1, y - containerRect.y1);
      selected.value.coordinates = drawService.dotsToString(selected.value.dots);
    }

    function fixCoor(x: number, y: number): any {
      const r = containerRect;
      if (x < r.x1) {
        x = r.x1;
      } else if (x > r.x2) {
        x = r.x2;
      }
      if (y < r.y1) {
        y = r.y1;
      } else if (y > r.y2) {
        y = r.y2;
      }
      return {x, y};
    }

    function isInArea(x: number, y: number): boolean {
      const r = containerRect;
      return !(x < r.x1 || y < r.y1 || x > r.x2 || y > r.y2);
    }

    const isZones = (): boolean => {
      return tab.value === 'zones';
    };

    function onAdd() {
      if (isZones()) {
        zonesService.value.onAdd();
      } else {
        masksService.value.onAdd();
      }
    }

    function onUpdateList() {
      if (isZones()) {
        zonesService.value.onUpdateList();
      } else {
        masksService.value.onUpdateList();
      }
    }

    function onTableSelected(detail: any) {
      if (detail && detail.rows && detail.rows.length) {
        const item: ViewModel = detail.rows[0];
        if (isZones()) {
          zonesService.value.onTableSelected(item);
        } else {
          masksService.value.onTableSelected(item);
        }
      }
    }

    function onDelete(row: ViewModel) {
      if (isZones()) {
        zonesService.value.onDelete(row);
      } else {
        masksService.value.onDelete(row);
      }
    }

    function onTabsChanged() {
      if (isZones()) {
        if (zonesService.value.points.length > 0) {
          selected.value = {...zonesService.value.points[0]};
          zonesService.value.tableSelected = [{...selected.value}]
          zonesService.value.onTableSelected({...selected.value});
        } else {
          selected.value = {...emptyViewModel};
        }
        masksService.value.setSelected(null);
        zonesService.value.setSelected(selected.value);
      } else {
        if (masksService.value.points.length > 0) {
          selected.value = {...masksService.value.points[0]};
          masksService.value.tableSelected = [{...selected.value}];
          masksService.value.onTableSelected({...selected.value});
        } else {
          selected.value = {...emptyViewModel};
        }
        zonesService.value.setSelected(null);
        masksService.value.setSelected(selected.value);
        masksService.value.onTableSelected(selected.value);
      }
    }

    return {
      source, width, height, base64Image, zonesService, selected, loadingObject, tab, masksService,
      handleClick, handleRightClick, handleDragStart, handleDragEnd, handleDragging, onAdd, onTableSelected, onDelete, onTabsChanged,
      onTakeScreenshot: takeScreenshot,
      columns: [
        {name: 'coordinates', align: 'left', label: 'Zone Coordinates', field: 'coordinates', sortable: true},
        {name: 'delete', align: 'center', label: '', field: 'delete'}
      ]
    };
  }
};

class DrawService {
  public static bias = 10;
  private readonly width: number;
  private readonly height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public dotsToString(newDots: Dot[]): string {
    const parseDot = (value: string): number => {
      value = value.replace('px', '');
      return parseInt(value) - DrawService.bias;
    };
    const arr = [];
    for (const dot of newDots) {
      arr.push(parseDot(dot.left));
      arr.push(parseDot(dot.top));
    }
    return arr.join(',');
  }

  public createDot(event: any): Dot {
    return {
      id: nanoid().toString(),
      top: DrawService.boundedSize(event.offsetY, this.height) + 'px',
      left: DrawService.boundedSize(event.offsetX, this.width) + 'px',
      width: '20px',
      height: '20px',
      cursor: 'pointer',
      opacity: 1.
    };
  }

  public editDot(dot: Dot, x: number, y: number) {
    dot.top = DrawService.boundedSize(y, this.height) + 'px';
    dot.left = DrawService.boundedSize(x, this.width) + 'px';
  }

  private static boundedSize(offset: number, maxValue: number) {
    offset = offset + DrawService.bias;
    return Math.min(Math.max(0, Math.round(offset)), maxValue);
  }
}

interface Dot {
  id: string;
  top: string;
  left: string;
  width: string;
  height: string;
  cursor: string;
  opacity: number;
}

interface ViewModel {
  id: string;
  dots: Dot[];
  coordinates: string;
}

interface React {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  bias: number;
}

class WrapperService {
  private readonly eventName: string;
  private readonly emit: any;
  private readonly separator: string;
  private readonly drawService: DrawService;
  public points: ViewModel[];
  public tableSelected: ViewModel[];
  private readonly setter: (arg: ViewModel) => void;
  private readonly arraySeparator: string;

  constructor(eventName: string, emit: any, separator: string, width: number, height: number, setter: (arg: ViewModel) => void) {
    this.eventName = eventName;
    this.emit = emit;
    this.separator = separator;
    this.drawService = new DrawService(width, height);
    this.points = [];
    this.tableSelected = [];
    this.setter = setter;
    this.arraySeparator = '+';
  }

  private selected: ViewModel | null = null;

  public setSelected(selected: ViewModel | null) {
    this.selected = selected;
  }

  public unmarshalPoints(line: string) {
    this.points.length = 0;
    if (!isNullOrEmpty(line)) {
      const zonesList = line.split(this.arraySeparator);
      for (const zoneList of zonesList) {
        const zones = zoneList.split(this.separator);
        const dots: Dot[] = [];
        for (let j = 0; j < zones.length; j += 2) {
          const left = zones[j] + 'px';
          const top = zones[j + 1] + 'px';
          dots.push({id: nanoid().toString(), top, left, width: '20px', height: '20px', cursor: 'pointer', opacity: 1.});
        }
        const pts = this.drawService.dotsToString(dots);
        this.points.push({id: nanoid().toString(), dots: dots, coordinates: pts});
      }
    }
    if (this.points.length > 0) {
      this.setValues(this.points[0]);
    }
  }

  public onAdd() {
    if (this.selected === null) {
      return;
    }
    const newOne: ViewModel = {id: nanoid().toString(), dots: [], coordinates: ''};
    this.points.push(newOne);
    this.setValues(newOne);
  }

  private emitEvent() {
    const sep = this.separator;
    //@ts-ignore
    const arr = new List<ViewModel>(this.points).Select(x => {
      const coordinates = x.coordinates.split(',');
      let j = 0;
      for (const c of [...coordinates]) {
        coordinates[j++] = (parseInt(c) + DrawService.bias).toString();
      }
      return coordinates.join(sep);
    }).ToArray();
    this.emit(this.eventName, arr.join(this.arraySeparator));
  }

  public onUpdateList() {
    if (this.selected == null || this.selected.id.length === 0) {
      return;
    }
    this.selected.coordinates = this.drawService.dotsToString(this.selected.dots);

    let index = 0;
    for (const zone of [...this.points]) {
      if (zone.id === this.selected.id) {
        this.points[index] = deepCopy(this.selected);
        break;
      }
      ++index;
    }
    this.emitEvent();
  }

  public setValues(model: ViewModel) {
    if (this.selected === null) {
      return;
    }
    this.selected = deepCopy(model);
    this.setter(<ViewModel>this.selected);
    this.tableSelected = [model];
  }

  public onTableSelected(model: ViewModel) {
    if (this.selected === null) {
      return;
    }
    this.selected = model;
    this.setter(this.selected);
  }

  public onDelete(row: ViewModel) {
    if (this.selected === null) {
      return;
    }
    if (row) {
      this.points = new List(this.points).Where(x => x?.id !== row.id).ToArray();
      if (this.points.length) {
        this.selected = this.points[0];
      } else {
        this.selected = {id: '', dots: [], coordinates: ''};
      }
      this.setter(this.selected);
      this.emitEvent();
    }
  }
}

</script>

<style scoped>
.z-20 {
  z-index: 20;
}

.absolute {
  position: absolute;
}

.rounded-full {
  border-radius: 9999px;
}

.bg-gray-900 {
  --tw-bg-opacity: 1;
  background-color: rgba(17, 24, 39, var(--tw-bg-opacity));
}

.blink_me {
  animation: blinker 1s linear infinite;
  color: red;
  font-size: medium;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}

.alerts-border {
  border: 5px #ff0000 solid;
  animation: blink 1s;
  animation-iteration-count: 4000000000;
}

@keyframes blink {
  50% {
    border-color: #fff;
  }
}
</style>
