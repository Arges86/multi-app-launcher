<template>
  <div id='app'>
    <header class='toolbar toolbar-header'>
      <h1 class='title'>App Launcher</h1>
      <div class='toolbar-actions'>
         <button class="btn btn-default pull-right" @click='onClose'>
          <span class="icon icon-cancel"></span>
        </button>
      </div>
    </header>
    <router-view></router-view>
  </div>
</template>

<script>
const remote = require('electron').remote

export default {
  name: 'bulk-modem-tool',
  methods: {
    onClose () {
      const window = remote.getCurrentWindow()
      window.close()
    }
  }
}
</script>

<style>
@import '~@/assets/photon/css/photon.min.css';
@import '~@/assets/css/bootstrap.css';

.toolbar {
  -webkit-app-region: drag;
}

@media screen and (prefers-color-scheme: light), screen and (prefers-color-scheme: no-preference) {
    /*light theme*/
  body{
    color: rgb(51, 51, 51);
  }
  .user-select {
    color: rgb(0, 0, 0)
  }
}

@media screen and (prefers-color-scheme: dark) {
    /*dark theme*/
  body {
    color: rgb(218, 222, 224);
  }
  .user-select {
    color: rgb(187, 225, 250);
  }
}
</style>
