<template>
  <viewer ref='viewer' :images='images' :options='options'>
    <img v-for='image in images' :key='image.id' :src='image.imagePath' alt=''>
  </viewer>
</template>

<script lang='ts'>
import { ref } from 'vue';

export default {
  name: 'ViewerComponent',
  props: {
    images: {
      type: Array, //ImageItem[]
      required: true,
      default: () => {
        return [];
      }
    },
    showDelete: {
      type: Boolean
    }
  },
  emits: ['on-delete'],
  //@ts-ignore
  setup() {
    const viewer = ref<any>(null);
    let viewerInstance: any = null;
    return {
      viewerInstance, viewer

    };
  },
  data() {
    const options:any = {
      ready: () => {
        //@ts-ignore
        this.viewerInstance = this.viewer.root.viewer;
      },
      // inline: true,
      toolbar: {
        zoomIn: true,
        zoomOut: true,
        oneToOne: true,
        reset: true,
        prev: true,
        play: {
          show: true,
          size: 'large'
        },
        next: true,
        rotateLeft: true,
        rotateRight: true,
        flipHorizontal: true,
        flipVertical: true,
        //@ts-ignore
        download: this.showDelete ? () => {
          //@ts-ignore
          const src = this.viewerInstance.image.src;
          //@ts-ignore
          this.$emit('on-delete', src);
        } : undefined
      }
    };
    return {options};
  }
};
</script>

<style>
.viewer-download {
  content: "download";
  color: transparent;
  display: compact;
  font-size: 0;
  height: 25px;
  line-height: 0;
  width: 24px;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAACXUlEQVRoge2Yv2tTURTHP/fd+F9UyNwOjk62FZwcLRXUkGIVR8HB1hiDQlptcXWppkjrj4AVVwdbiNVRxziIQwZXBbuJufc6RJMXY9N38076WnifKdx3cs73y/1xLhdSUlIONUoymRvnDo7be1RcVtvckKopZiCS+E5VMRORDLirJ0+DWwFGJIpG4CvWXVEP3r7eKzCIlm9fxQOMoNRKlMCIBvZVfAvF0ShhUQ0cWLw2sTuBG5aQMOpddF2HfgZSA0mTGkia1EDSiBpw2VGRGB/EDJh8ieajj9hT53eNsRNTNB9+wFxelCpLRiKJyZewM6XW7/lVAILN510xdmIKU3wCOoM9dx0AXSnGrh17Blx2DJsrhDJqzFwFOzndHrKT023x7bGz13DZsbjl48+AatTRCznMracdgTqDKa5D5gj8+om5udYlHmvQy5dQjXrc8nKXOTt+ptsEgLWAg0CHxgx6aZZgq7q7qCQuc8H2K/RCDkwzNBh4i/euK5aJkAlrej86Ky4ehtHIVJ/Z7/dtQEQNtI/K8LL5iwow86t9+8QgiBkIn/OdQdu9nAItbkLEwP/FG/TSRXT5wj8bW9aESCPrEW+a6MU8wVa1tbHvzvSamKuINLLYBlSjjn4cepD706SC2kanSG2j54jVz+6JNDKRJRRU77fuNX3O+XCf0OtlgrWyRGnZZxWXHUU1PvXPESHGpxOn70JJkxpIGl8DO0NR0c0Pn2A/A45Nr/jBeOMT7DsDBeCb5398+I6msHdYBy8D6j2faXIMxwtkl9MO8BLNcVXji2DelJSUg85vwU3YNL7U328AAAAASUVORK5CYII=);
  background-repeat: no-repeat;
  background-size: 24px;
}
</style>