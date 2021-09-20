<template>
  <div id="info">
    <div class="center">
      <h4>App Info</h4>
    </div>
    <div>
      <p>{{ updateStatus }}</p>
      <div class="mt-1">
        <p><strong>Application Version:</strong> {{ version }}</p>
        <p><strong>Application Name:</strong> {{ name }}</p>
        <p><strong>App Resources:</strong></p>
        <p class="ml-1">
          <strong>CPU Usage:</strong> {{ cpuUsage.toFixed(3) }} %
        </p>
        <p class="ml-1">
          <strong>Memory Usage:</strong> {{ memUsage.toLocaleString("en") }} KB
        </p>
      </div>
    </div>
    <div class="mt-1" v-if="updateAvailable">
      <button class="btn btn-large btn-primary" @click="openLatest">
        <span style="color: white" class="icon icon-github-circled"></span>
        &nbsp; Download newest version
      </button>
      <div class="mt-1">
        <strong>Release Notes:</strong>
        <pre>{{ releases[0].body }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import github from '../services/github'
const remote = require('electron').remote

export default {
  name: 'app-info',
  data: () => ({
    version: remote.app.getVersion(), // applications sem version
    name: remote.app.name, // applications name from json file
    ProcessMetric: remote.app.getAppMetrics(), // Array of ProcessMetric objects
    releases: [], // return from querying github releases
    updateStatus: '', // text to display on apps status
    updateAvailable: false // boolean if update is available, to show:hide download button
  }),
  mounted () {
    this.getReleases()
  },
  methods: {
    async getReleases () {
      this.updateStatus = ''
      this.updateAvailable = false
      try {
        this.releases = await github.getReleases()
        this.getLatest(this.releases)
      } catch (error) {
        this.updateStatus =
          'Error getting release info. Please try again later.'
      }
    },
    getLatest (data) {
      const semver = require('semver')
      const latestVersion = data[0].tag_name

      // if the current app version is less than latest in github
      if (semver.gt(latestVersion, this.version)) {
        this.updateStatus = 'Newer version available!'
        this.updateAvailable = true
      } else {
        this.updateStatus = 'Application up to date.'
      }
    },
    openLatest () {
      const { shell } = require('electron')
      shell.openExternal(this.releases[0].html_url)
    }
  },
  computed: {
    cpuUsage () {
      return this.ProcessMetric.map((data) => data.cpu.percentCPUUsage).reduce(
        (a, b) => a + b
      )
    },
    memUsage () {
      return this.ProcessMetric.map(
        (data) => data.memory.workingSetSize
      ).reduce((a, b) => a + b)
    }
  }
}
</script>

<style scoped>
#info {
  z-index: 5;
  position: absolute;
  background: linear-gradient(180deg, black, #525252);
  height: 100%;
  top: 0px;
  width: 100%;
  overflow-y: auto;
  color: rgb(255, 255, 255);
}
.ml-1 {
  margin-left: 1rem;
}
.mt-1 {
  margin-top: 1rem;
}
.center {
  display: table;
  margin-right: auto;
  margin-left: auto;
}
</style>