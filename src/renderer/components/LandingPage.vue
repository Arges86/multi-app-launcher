<template>
  <div>
    <div id="wrapper container">
      <div class="row">
        <button class="btn btn-default pull-left firstButton" @click='onSave'>Save</button>
        <!-- <div class="dropdown">
          <button class="btn btn-default btn-dropdown secondButton" @click="show = !show">
            Profiles
          </button>
          <div class="dropdown-content" v-if="show">
            <div>Profile 1</div>
            <div>Profile 2</div>
            <div>Profile 3</div>
          </div>
        </div> -->

      </div>
      <div class="row">
        How many programs: {{numbers}}
        <div class="slidecontainer">
          <input type="range" min="1" max="20" value="5" class="slider" v-model="numbers" @change="onChange(numbers)">
        </div>
      </div>
      <div class="row">
        <button class="btn btn-primary" @click="submit">Start All Programs</button>
      </div>
      <div class="row">
        <div v-for="program in programs" :key="program.id" class="col-3 program">
          <div class="user-select">
            Choose your program
          </div>
          <div class="row">
             <div class="col-6">
              <file-ingest @load="addUrl" :input="program"></file-ingest>
            </div>
            <div class="col-6">
              <button class="btn btn-mini btn-default" @click="ClearProgram(program.id)">Clear</button>
            </div>
          </div>
          <div class="row small">
            {{program.url}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import FileIngest from './LandingPage/FileIngest'
  const Shell = require('node-powershell')
  const settings = require('electron').remote.require('electron-settings')
  
  export default {
    name: 'landing-page',
    components: { FileIngest },
    data: () => ({
      paths: [],
      numbers: 5,
      show: false,
      programs: [
        {
          id: 1,
          url: ''
        },
        {
          id: 2,
          url: ''
        },
        {
          id: 3,
          url: ''
        },
        {
          id: 4,
          url: ''
        },
        {
          id: 5,
          url: ''
        }
      ]
    }),
    mounted () {
      const mySettings = settings.getAll()
      console.log(mySettings)
      if (mySettings.userData) {
        this.programs = mySettings.userData
        this.numbers = this.programs.length
      }
    },
    methods: {
      addUrl (data) {
        const objIndex = this.programs.findIndex(obj => obj.id === data.id)
        this.programs[objIndex].url = data.url
        this.programs.push([])
        this.programs.pop()
      },
      onChange (v) {
        console.log(v)
        const initial = this.programs.length
        const diff = v - initial
        console.log(diff)

        // if adding to array
        if (diff > 0) {
          for (let index = 0; index < diff; index++) {
            console.log(index)
            this.programs.push({
              id: initial + (index + 1),
              url: ''
            })
          }
        }

        // if removing from array
        if (diff < 0) {
          for (let index = 0; index < Math.abs(diff); index++) {
            this.programs.pop()
          }
        }
      },
      submit () {
        console.log('Starting all programs...')

        this.programs.forEach(element => {
          if (element.url) {
            const ps = new Shell({
              executionPolicy: 'Bypass',
              noProfile: true
            })
            ps.addCommand(`Start-Process -FilePath "${element.url}"`)
            ps.invoke()
          }
        })
      },
      onSave () {
        console.log('Saving')
        settings.set('userData', this.programs)
      },
      ClearProgram (id) {
        const objIndex = this.programs.findIndex(obj => obj.id === id)
        this.programs[objIndex].url = ''
        this.programs.push([])
        this.programs.pop()
      }
    }
  }
</script>

<style>

  /* source-sans-pro-regular - latin */
  @font-face {
    font-family: 'Source Sans Pro';
    font-style: normal;
    font-weight: 400;
    src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'),
      url('~@/assets/fonts/source-sans-pro-v13-latin-regular.woff2') format('woff2'),
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(223, 223, 223, 0.9) 100%
      );
    height: 100vh;
    padding: 20px 30px;
    width: 100vw;
  }

  #logo {
    height: auto;
    margin-bottom: 20px;
    width: 220px;
  }

  main {
    display: flex;
    justify-content: space-between;
  }

  main > div { flex-basis: 50%; }

  .welcome {
    color: #555;
    font-size: 23px;
    margin-bottom: 10px;
  }

 .inputForm {
   max-width: 70%;
 }

 .user-select {
   -webkit-user-select: none;
    cursor: default;
 }

 .slidecontainer {
  width: 100%; /* Width of the outside container */
}

/* The slider itself */
.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 15px;
  border-radius: 5px;  
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

/* Mouse-over effects */
.slider:hover {
  opacity: 1;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 25px;
  height: 25px;
  background: rgb(34, 52, 209);
  border-radius: 50%; 
  cursor: pointer;
}

.program {
  border: solid rgb(0, 0, 255) thin;
  padding: 0px 5px 20px 5px;
  border-radius: 15px;
}

.firstButton {
  top: -31px;
  position: absolute;
}

.secondButton {
    position: absolute;
    top: -31px;
    left: 42px;
}

.dropdown-content-hide {
  display: none;
  position: absolute;
  top: -8px;
  left: 42px;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  padding: 12px 16px;
  z-index: 1;
}

.dropdown-content {
  display: block;
  position: absolute;
  top: -8px;
  left: 42px;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  padding: 12px 16px;
  z-index: 1;
}

/* Links inside the dropdown */
.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.small {
  font-size: .8rem;
}

</style>
