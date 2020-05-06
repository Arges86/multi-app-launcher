<template>
  <div>
    <div class="container-fluid" id="wrapper">
      <div class="row">
        <button class="btn btn-default pull-left firstButton buttonHover" @click='showModal'>Save As</button>
        <div class="dropdown">
          <button class="btn btn-default btn-dropdown secondButton buttonHover" @click="showDropdown = !showDropdown">
            Profiles
          </button>
          <div class="dropdown-content" v-if="showDropdown">
            <div class="content" v-for="profile in profiles" :key="profile">
              <button @click="loadProfile(profile)" class="btn btn-mini btn-primary pull-left buttonPrimaryHover">{{profile}}</button>
              <button class="btn btn-mini btn-default rename buttonHover" @click="renameProfile(profile)">Rename</button>
              <span @click="deleteProfile(profile)" class="icon icon-cancel deleteProfile pull-right"></span>
              <hr>
            </div>
          </div>
        </div>
      </div>

      <div style="height: 100vh;" @click="showDropdown = false">
        <div class="row">
          How many programs: {{numbers}}
          <div class="slidecontainer">
            <input type="range" min="1" max="20" value="5" class="slider" v-model="numbers" @change="onChange(numbers)">
          </div>
        </div>
        <div class="row">
          <button class="btn btn-primary buttonPrimaryHover" @click="submit">Start All Programs</button>
        </div>
        <div class="row mt-1">
          <div v-for="(program, index) in programs" :key="program.id">
          <div class="row" v-if="index !== 0 && (index % 4) === 0"></div>
            <div class="col-md-3 program">
              <div class="row">
                <div class="user-select">
                  Choose your program
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <file-ingest @load="addUrl" :input="program"></file-ingest>
                </div>
                <div class="col-md-6">
                  <button class="btn btn-mini btn-default buttonHover" @click="ClearProgram(program.id)">Clear</button>
                </div>
              </div>
              <div v-if="program.url" class="row-no-gutters small">
                <br>
                <div class="col-md-2">
                  <img @click="openSingle(program.url)" v-if="program.icon" class="pull-left" :src="program.icon" alt="Programs Icon">
                </div>
                <div class="col-md-10">{{program.url}}</div>
              </div>
          </div>
          </div>
        </div>
      </div>

      <modal
        v-show="isModalVisible"
        :reset="isModalVisible"
        :oldName="oldName"
        @close="closeModal"
      />
    </div>
  </div>
</template>

<script>
  import FileIngest from './LandingPage/FileIngest'
  import Modal from './LandingPage/Modal.vue'
  import path from 'path'
  const { shell } = require('electron')
  const app = require('electron').remote.app
  const settings = require('electron').remote.require('electron-settings')
  
  export default {
    name: 'landing-page',
    components: { FileIngest, Modal },
    data: () => ({
      isModalVisible: false, // toggles visibility of the Save As modal
      profiles: [], // array of user profiles
      numbers: 5, // default number of program boxes
      showDropdown: false, // toggles the profile picker dropdown
      allSettings: {}, // object of all user settings
      oldName: null, // old profile name when renaming profile
      programs: [
        {
          id: 1,
          url: '',
          icon: ''
        },
        {
          id: 2,
          url: '',
          icon: ''
        },
        {
          id: 3,
          url: '',
          icon: ''
        },
        {
          id: 4,
          url: '',
          icon: ''
        },
        {
          id: 5,
          url: '',
          icon: ''
        }
      ] // array of objects of programs, and their locations
    }),
    mounted () {
      this.getProfiles()
    },
    methods: {
      getProfiles () {
        this.allSettings = settings.getAll()
        if (this.allSettings) {
          Object.entries(this.allSettings).forEach(
            ([key, value]) => this.profiles.push(key)
          )
        }
        console.log(this.allSettings)
      },
      loadProfile (profile) {
        this.showDropdown = false
        this.programs = this.allSettings[profile]
        this.numbers = this.programs.length

        this.programs.forEach(element => {
          if (!element.icon) {
            this.getImage(element)
          }
        })
        this.programs.push([])
        this.programs.pop()
      },
      deleteProfile (profile) {
        settings.delete(profile)
        this.profiles = []
        this.showDropdown = false
        this.getProfiles()
      },
      renameProfile (profile) {
        this.oldName = profile
        this.showModal()
      },
      addUrl (data) {
        const objIndex = this.programs.findIndex(obj => obj.id === data.id)
        this.programs[objIndex].url = data.url
        this.getImage(data)
      },
      onChange (v) {
        const initial = this.programs.length
        const diff = v - initial

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
        this.programs.forEach(element => {
          if (element.url) {
            shell.openItem(element.url)
          }
        })
      },
      openSingle (url) {
        shell.openItem(url)
      },
      ClearProgram (id) {
        const objIndex = this.programs.findIndex(obj => obj.id === id)
        this.programs[objIndex].url = ''
        this.programs.push([])
        this.programs.pop()
      },
      showModal () {
        this.isModalVisible = true
        this.showDropdown = false
      },
      closeModal (data) {
        this.isModalVisible = false
        this.oldName = null
        if (data) {
          // if renaming existing profile
          if (data.old) {
            const temp = this.allSettings[data.old]
            settings.set(data.new, temp)
            this.deleteProfile(data.old)

          // if saving new profile
          } else if (data.new) {
            settings.set(data.new, this.programs)
            this.profiles = []
            this.getProfiles()
          }
        }
      },
      async getImage (data) {
        let icon
        try {
          const NativeImage = await app.getFileIcon(path.normalize(data.url))
          icon = NativeImage.toDataURL()

        // sets a default icon
        } catch (error) {
          console.log(error)
          icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEaSURBVFhH7ZTbCoJAEIaFCCKCCKJnLTpQVBdB14HQ00T0CqUP4AN41puJAVe92F3HRZegHfgQFvH7/1nQMmPmZ+Z8uYJOCm01vJe64PF8cZ+Ftho89DxPC8IAeZ73QpZlJWmattsAfsBavsk0yRsD3Ox7ST3A4uTC/OjC7ODCdO/AZOfAeOvAaPOB4foDg1UVwLZtIUmSqG2AIq9vgNcc5coBKHIWgNec0RhAdAUUOSJrjsRxrLYBihxBMa85QzkARY7ImjOkAURXQJEjKOY1Z0RRpLYBihyRNUe5cgCKHEEprzmjMYDoCqjImiNhGKptgApvA3V57wFkzbUGEMmDIGgfAKH84ShypQBdyn3fFwfQSaE1Y+bvx7K+efsbU5+Ow3MAAAAASUVORK5CYII='
        }
        const objIndex = this.programs.findIndex(obj => obj.id === data.id)
        this.programs[objIndex].icon = icon
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
  padding: 0px 5px 10px 5px;
  border-radius: 15px;
  overflow-wrap: break-word;
}

.firstButton {
  top: 1.9rem;
  left: 0.2rem;
  position: absolute;
}

.secondButton {
  position: absolute;
  top: 1.9rem;
  left: 3.7rem;
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
  top: 3.3rem;
  left: 3.7rem;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  padding: 12px 7px 0px;
  z-index: 1;
  color: rgb(0, 0, 0);
}

/* Links inside the dropdown */
.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.row {
  margin-right: 0px !important;
  margin-left: 0px !important;
}

.mt-1 {
  margin-top: 1rem;
}

.selectProfile {
  cursor: pointer;
}
.selectProfile:hover {
  background: rgb(216, 216, 216);
}

.rename {
  margin-left: 15px;
  margin-right: -8px;
}

.deleteProfile {
  margin-left: 2rem;
  color: red;
  padding: .1rem 1rem;
  border-radius: 25px;
  cursor: pointer;
}
.deleteProfile:hover {
  background: rgb(216, 216, 216);
}

.content:hover, .content:focus {
  background-color: rgb(228, 228, 228);
  text-decoration: underline;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
}

img {
  padding:  0px 4px 5px 0px;
  border-radius: 15px;
}
img:hover, img:focus {
  background-image: radial-gradient(circle, rgb(193, 193, 193), rgba(146, 145, 145, 0));
}
</style>
