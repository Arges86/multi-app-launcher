<template>
  <div id='app' :class="[blur ? 'blur-app' : '']">
    <header class='toolbar toolbar-header'>
      <img @click="getMenu" class="ProgramIcon" src="~@/assets/icon.png">
      <span v-if="checkingStatus" class="icon icon-arrows-ccw status-icon"></span>
      <span v-if="showStatus" @click="getMenu" class="icon icon-info-circled status-icon"></span>
      <h1 class='title'><strong>M</strong>ulti <strong>A</strong>pp <strong>L</strong>auncher</h1>
      <div class='toolbar-actions'>
         <button class="btn btn-mini btn-default pull-right buttonHover" @click='onClose'>
          <span class="icon icon-cancel"></span>
        </button>
        <button class="btn btn-mini btn-default pull-right buttonHover" @click="minimize">
          <span class="icon icon-minus"></span>
        </button>
      </div>
    </header>
    <router-view></router-view>
  </div>
</template>

<script>
import github from './services/github'
const remote = require('electron').remote

export default {
  name: 'bulk-modem-tool',
  data: () => ({
    showStatus: false, // if update available icon is shown
    checkingStatus: false, // if checking for update icon is shown
    blur: false // toggles whole application blur
  }),
  mounted () {
    this.getReleases()
  },
  methods: {
    onClose () {
      const window = remote.getCurrentWindow()
      window.close()
    },
    minimize () {
      remote.getCurrentWindow().minimize()
    },
    async getReleases () {
      this.checkingStatus = true
      try {
        const release = await github.getReleases()
        const latestVersion = release[0].tag_name
        const semver = require('semver')
        this.checkingStatus = false
        if (semver.gt(latestVersion, remote.app.getVersion())) {
          this.showStatus = true
        }
      } catch (error) {
        this.checkingStatus = false
      }
    },
    getMenu () {
      const BrowserWindow = remote.BrowserWindow
      const winURL = process.env.NODE_ENV === 'development'
        ? 'http://localhost:9080/#/info'
        : `file://${__dirname}/index.html#info`
      const top = remote.getCurrentWindow()
      const x = (top.getPosition()[0]) + 50
      const y = (top.getPosition()[1]) + 50
      this.blur = true

      const window = new BrowserWindow({
        height: 300,
        width: 300,
        x,
        y,
        minimizable: false,
        maximizable: false,
        useContentSize: true,
        type: 'toolbar',
        frame: true,
        parent: top,
        modal: true,
        webPreferences: {
          nodeIntegration: true
        }
      })
      window.setMenu(null)
      window.loadURL(winURL)

      window.on('close', () => {
        this.blur = false
      })
    }
  }
}
</script>

<style>
@import '~@/assets/photon/css/photon.min.css';
@import '~@/assets/css/bootstrap.css';
@import '~@/assets/css/tooltip.css';

.toolbar {
  -webkit-app-region: drag;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body { 
  font-family: 'Source Sans Pro', sans-serif;
}

.ProgramIcon {
  width: 29px;
  position: absolute;
  -webkit-app-region: no-drag !important;
}
  
/*light theme*/
@media screen and (prefers-color-scheme: light), screen and (prefers-color-scheme: no-preference) {
  body{
    color: rgb(51, 51, 51);
    background: linear-gradient(180deg, rgba(172,172,172,1) 0%, rgba(191,191,191,1) 26%, rgba(219,219,219,1) 92%, rgba(255,255,255,0.8491597322522759) 100%);
  }
  label {
    color: rgb(0, 0, 0);
  }
  .user-select {
    color: rgb(0, 0, 0)
  }
}

/*dark theme*/
@media screen and (prefers-color-scheme: dark) {
  body {
    color: rgb(218, 222, 224);
    background: linear-gradient(180deg, rgba(172,172,172,1) 0%, rgba(2,0,36,1) 26%, rgba(5,5,82,1) 92%, rgba(9,9,121,0.8491597322522759) 100%);
  }
  label {
    color: rgb(255, 255, 255);
  }
  .user-select {
    color: rgb(187, 225, 250);
  }
}

.buttonHover:hover {
  background-image: linear-gradient(rgb(193, 193, 193), rgb(146, 145, 145));
}

.buttonPrimaryHover:hover {
  background:rgb(59, 155, 245);
}

.blur-app{
  filter: blur(1px);
}

.status-icon {
  color: black;
  position: absolute;
  left: 19px;
  top: 15px;
  color: rgb(0, 0, 139);
  -webkit-app-region: no-drag !important;
}
</style>
