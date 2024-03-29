<template>
  <div
    id="app"
    :class="[blur ? 'blur-app' : '']"
  >
    <header class="toolbar toolbar-header">
      <div class="row">
        <div class="col-md-4">
          <img
            class="ProgramIcon"
            src="~@/assets/icon.png"
            @click="getMenu"
          >
          <span
            v-if="showStatus"
            class="icon icon-arrows-ccw status-icon"
          />
          <span
            v-if="showStatus"
            class="icon icon-info-circled status-icon"
            @click="getMenu"
          />
        </div>
        <div class="col-md-4">
          <span class="title">
            <strong>M</strong>ulti &nbsp;
            <strong>A</strong>pp &nbsp;
            <strong>L</strong>auncher 
          </span>
        </div>
        <div class="col-md-4">
          <span
            class="icon icon-cancel pull-right menuButton"
            @click="onClose"
          />
          <span
            class="icon icon-minus pull-right menuButton"
            @click="minimize"
          />
        </div>
      </div>
    </header>
    <router-view />
  </div>
</template>

<script>
import github from "./services/github";
import { ipcRenderer } from "electron";
import { getCurrentWindow, app } from "@electron/remote";

export default {
  name: "MultiAppLauncher",
  data: () => ({
    showStatus: false, // if update available icon is shown
    checkingStatus: false, // if checking for update icon is shown
    blur: false // toggles whole application blur
  }),
  mounted () {
    this.getReleases();
  },
  methods: {
    onClose () {
      getCurrentWindow().close();
    },
    minimize () {
      getCurrentWindow().minimize();
    },
    async getReleases () {
      this.checkingStatus = true;
      try {
        const release = await github.getReleases();
        const latestVersion = release[0].tag_name;
        const semver = require("semver");
        this.checkingStatus = false;
        if (semver.gt(latestVersion, app.getVersion())) {
          this.showStatus = true;
        }
      } catch (error) {
        this.checkingStatus = false;
      }
    },
    getMenu () {
      this.blur = true;
      ipcRenderer.send("open-info");

      ipcRenderer.on("close-info", (_event, _arg) => {
        this.blur = false;
      });
    }
  }
};
</script>

<style>
@import "./assets/photon/css/photon.min.css";
@import "./assets/css/bootstrap.css";
@import "./assets/css/tooltip.css";

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}

.toolbar {
  -webkit-app-region: drag;
}

.title {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
}

.ProgramIcon {
  width: 29px;
  -webkit-app-region: no-drag !important;
  margin-bottom: -7px;
}

/*light theme*/
@media screen and (prefers-color-scheme: light),
  screen and (prefers-color-scheme: no-preference) {
  body {
    color: rgb(51, 51, 51);
    background: linear-gradient(
      180deg,
      rgba(172, 172, 172, 1) 0%,
      rgba(191, 191, 191, 1) 26%,
      rgba(219, 219, 219, 1) 92%,
      rgba(255, 255, 255, 0.8491597322522759) 100%
    );
  }
  label {
    color: rgb(0, 0, 0);
  }
  .user-select {
    color: rgb(0, 0, 0);
  }
}

/*dark theme*/
@media screen and (prefers-color-scheme: dark) {
  body {
    color: rgb(218, 222, 224);
    background: linear-gradient(
      180deg,
      rgba(172, 172, 172, 1) 0%,
      rgba(2, 0, 36, 1) 26%,
      rgba(5, 5, 82, 1) 92%,
      rgba(9, 9, 121, 0.8491597322522759) 100%
    );
  }
  label {
    color: rgb(255, 255, 255);
  }
  .user-select {
    color: rgb(187, 225, 250);
  }
}

.menuButton {
  color: rgb(0, 0, 0);
  padding: 0px 10px 0px 8px;
  font-size: large;
  -webkit-app-region: no-drag !important;
}
.menuButton:hover {
  background: rgb(119, 136, 153, 0.6);
  color: rgb(255, 0, 0);
}
.menuButton:active {
  background: rgb(119, 136, 153, 0.8);
}

.buttonHover:hover {
  background-image: linear-gradient(rgb(218, 218, 218), rgb(162, 162, 162));
}
.buttonHover:active {
  background-image: linear-gradient(rgb(182, 180, 180), rgb(134, 134, 134));
}

.buttonPrimaryHover:hover {
  background: rgb(59, 155, 245);
}
.buttonPrimaryHover:active {
  background: rgb(43, 136, 223);
}

.blur-app {
  filter: blur(1px);
}

.status-icon {
  color: black;
  position: absolute;
  left: 2rem;
  top: 0.9rem;
  color: rgb(0, 0, 139);
  -webkit-app-region: no-drag !important;
}
</style>
