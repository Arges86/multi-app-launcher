<template>
  <!-- <div> -->
    <button class="btn btn-mini btn-default buttonHover" type="file" accept=".exe" @click="openfile">
     Pick File <span style="color: green;" class="icon icon-cog"></span>
    </button>
  <!-- </div> -->
</template>

<script>
import config from '../../assets/config'
const {remote} = require('electron')

export default {
  props: {
    input: {
      type: Object
    }
  },
  methods: {
    loadTextFromFile (ev) {
      const file = ev.target.files[0]
      const reader = new FileReader()

      reader.onload = e => this.$emit('load', e.target.result)
      reader.readAsText(file)
    },
    async openfile () {
      const dialog = remote.dialog
      const WIN = remote.getCurrentWindow()

      let options = {}
      if (process.platform === 'win32') {
        options = {
          title: 'Find a Program',
          buttonLabel: 'Pick file',
          filters: [
            {name: 'Executable', extensions: ['exe']},
            {name: 'All Files', extensions: ['*']}
          ],
          properties: ['openFile']
        }
      } else {
        options = {
          title: 'Find a Program',
          buttonLabel: 'Pick shortcut',
          defaultPath: config.LinuxPath,
          filters: [
            {name: 'Shortcut', extensions: ['desktop']},
            {name: 'All Files', extensions: ['*']}
          ],
          properties: ['openFile']
        }
      }

      let filePath = await dialog.showOpenDialog(WIN, options)

      if (filePath.canceled) {
        // console.log('Operation was canceled')
      } else {
        const path = filePath.filePaths[0]

        const output = {
          id: this.input.id,
          url: path
        }
        this.$emit('load', output)
      }
    }
  }
}
</script>

<style scoped>
.text-reader {
  position: relative;
  overflow: hidden;
  display: inline-block;

  /* Fancy button looking */
  border: 2px solid black;
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
}
.text-reader input {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  opacity: 0;
}
</style>