<template>
    <div id="info">
       <div class="center"><h4>App Info</h4></div>
       <div>
        <p>Application Version: {{version}}</p>
        <p>Application Name: {{name}}</p>
        <p>App Resources:</p>
        <p class="ml-1">CPU Usage: {{cpuUsage}} %</p>
        <p class="ml-1">Memory Usage: {{memUsage.toLocaleString('en')}} KB</p>
       </div>
    </div>
</template>

<script>
const remote = require('electron').remote

export default {
  name: 'app-info',
  data: () => ({
    version: remote.app.getVersion(),
    name: remote.app.getName(),
    ProcessMetric: remote.app.getAppMetrics()
  }),
  mounted () {
    console.log('App Info mounted')
    console.log(remote.app.getAppMetrics())
  },
  computed: {
    cpuUsage () {
      return this.ProcessMetric.map(data => data.cpu.percentCPUUsage)
        .reduce((a, b) => a + b)
    },
    memUsage () {
      return this.ProcessMetric.map(data => data.memory.workingSetSize)
        .reduce((a, b) => a + b)
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
}
.ml-1 {
  margin-left: 1rem;
}
.center {
  display: table;
  margin-right: auto;
  margin-left: auto;
}
</style>