<template>
  <div id='app'>
    <header class='toolbar toolbar-header'>
      <img class="ProgramIcon" src="~@/assets/icon.png">
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
const remote = require('electron').remote

export default {
  name: 'bulk-modem-tool',
  methods: {
    onClose () {
      const window = remote.getCurrentWindow()
      window.close()
    },
    minimize () {
      remote.getCurrentWindow().minimize()
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
}
  

@media screen and (prefers-color-scheme: light), screen and (prefers-color-scheme: no-preference) {
    /*light theme*/
  body{
    color: rgb(51, 51, 51);
  }
  label {
    color: rgb(0, 0, 0);
  }
  .user-select {
    color: rgb(0, 0, 0)
  }
}

@media screen and (prefers-color-scheme: dark) {
    /*dark theme*/
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
</style>
