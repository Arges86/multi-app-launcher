<template>
  <div>
    <div class="container-fluid" id="wrapper">
      <div class="row">
        <button class="btn btn-default pull-left firstButton buttonHover" @click="showModal">Save As</button>
        <div class="dropdown">
          <button
            class="btn btn-default btn-dropdown secondButton buttonHover"
            @click="showDropdown = !showDropdown"
          >Profiles</button>
          <div class="dropdown-content" v-if="showDropdown">
            <div v-if="profiles.length == 0">No Profiles saved</div>
            <div v-else class="content" v-for="profile in profiles" :key="profile">
              <button
                @click="loadProfile(profile)"
                class="btn btn-mini btn-primary pull-left buttonPrimaryHover"
              >{{profile}}</button>
              <button
                class="btn btn-mini btn-default rename buttonHover"
                @click="renameProfile(profile)"
              >Rename</button>
              <span
                @click="deleteProfile(profile)"
                class="icon icon-cancel deleteProfile pull-right"
              ></span>
              <hr />
            </div>
          </div>
        </div>
      </div>

      <div style="height: 100vh;" @click="showDropdown = false">
        <div class="row">
          How many programs: {{numbers}}
          <div class="slidecontainer">
            <input
              type="range"
              min="1"
              max="40"
              value="5"
              class="slider"
              v-model="numbers"
            />
          </div>
        </div>
        <div class="row">
          <button class="btn btn-primary buttonPrimaryHover" @click="submit">Start All Programs</button>
        </div>
        <div class="row mt-1 scrollable">
          <div v-for="(program, index) in programs" :key="program.id">
            <div class="row" v-if="index !== 0 && (index % 4) === 0"></div>
            <div class="col-md-3 program">
              <div class="row">
                <div class="user-select">Choose your program</div>
              </div>
              <div class="row">
                <div class="btn-group" style="padding-left: 5%;">
                  <file-ingest @load="addUrl" :input="program"></file-ingest>
                  <button class="btn btn-default buttonHover"  @click="showSearch(program.id)">
                    <span
                      class="icon"
                      :class="[whichTextBox == program.id ? 'icon-down-open-big' : 'icon-up-open-big']"
                    ></span>&nbsp; Search 
                  </button>
                  <button class="btn btn-default buttonHover" @click="ClearProgram(program.id)">
                    <span style="color: red;" class="icon icon-cancel"></span>Clear
                  </button>
                </div>
              </div>
              <div class="row" v-if="!program.url && whichTextBox != program.id" >
                <div class="box-input" @drop.prevent="addFile($event, program.id)" @dragenter.prevent @dragover.prevent="dragOver" @dragleave="dragLeave">
                  <div class="inner-box"> Drag and Drop</div>
                </div>
              </div>
              <div class="row" v-show="whichTextBox == program.id">
                <form>
                  <div class="form-group mt-1">
                    <label for="pofileName">Search Program</label>
                    <input
                      type="text"
                      id="pofileName"
                      class="form-control"
                      placeholder="Outlook"
                      v-model="search"
                    />
                  </div>
                </form>
                <div v-if="search && whichTextBox == program.id">
                  <div
                    class="card"
                    v-for="(post, index) in filteredList.slice(0,10)"
                    :key="post + index"
                  >
                    <div class="row list" @click="addUrl({id:program.id, url:post.path})">
                      <div class="col-md-6">
                        <programIcon :url="post.path " />
                      </div>
                      <div class="col-md-6">
                        <div style="margin-top: 5px;">{{post.name}}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="program.url" class="row-no-gutters small">
                <br />
                <div class="col-md-2">
                  <img
                    @click="openSingle(program.url)"
                    v-if="program.icon"
                    style="max-width: 36px;'"
                    class="pull-left"
                    :src="program.icon"
                    alt="Programs Icon"
                  />
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
  import Vue from 'vue'
  import path from 'path'
  import config from '../assets/config'
  import parser from '../services/linuxparse'
  const { shell } = require('electron')
  const app = require('electron').remote.app
  const settings = require('electron').remote.require('electron-settings')
  
  export default {
    name: 'landing-page',
    components: { FileIngest, Modal },
    data: () => ({
      isModalVisible: false, // toggles visibility of the Save As modal
      whichTextBox: null,
      profiles: [], // array of user profiles
      numbers: 5, // default number of program boxes
      showDropdown: false, // toggles the profile picker dropdown
      allSettings: {}, // object of all user settings
      oldName: null, // old profile name when renaming profile
      allPrograms: [], // array of applications found on default location
      search: '', // string to filter 'allPrograms' by
      searchId: 0, // which instnace of the 'programs' object is searching for an application
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
      this.getList()
    },
    methods: {
      getProfiles () {
        this.allSettings = settings.getAll()
        if (this.allSettings) {
          Object.entries(this.allSettings).forEach(
            ([key, value]) => this.profiles.push(key)
          )
        }
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
        // if Windows shortcut
        if (data.url.endsWith('.lnk')) {
          try {
            data.url = shell.readShortcutLink(data.url).target
          } catch (error) {}
        }

        // if Linux shortcut
        if (data.url.endsWith('.desktop')) {
          this.processLinux(data)
        } else {
          const objIndex = this.programs.findIndex(obj => obj.id === data.id)
          this.programs[objIndex].url = data.url
          this.getImage(data)
        }
        this.whichTextBox = null
      },
      async processLinux (data) {
        const objIndex = this.programs.findIndex(obj => obj.id === data.id)
        const parsed = await parser.parseDesktop(data.url)
        this.programs[objIndex].url = parsed.url
        this.programs[objIndex].icon = parsed.icon
      },
      addFile (event, id) {
        if (event.dataTransfer.files[0]) {
          this.addUrl({id: id, url: event.dataTransfer.files[0].path})
        }
      },
      submit () {
        const exec = require('child_process').exec
        this.programs.forEach(element => {
          if (element.url) {
            if (element.url.endsWith('exe')) {
              shell.openItem(element.url)
            } else {
              exec(element.url)
            }
          }
        })
      },
      openSingle (url) {
        if (url.endsWith('exe')) {
          shell.openItem(url)
        } else {
          const exec = require('child_process').exec
          exec(url)
        }
      },
      ClearProgram (id) {
        const objIndex = this.programs.findIndex(obj => obj.id === id)
        this.programs[objIndex].url = ''
        this.search = null
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
      showSearch (data) {
        this.search = null
        if (this.whichTextBox === data) {
          this.whichTextBox = null
        } else {
          this.whichTextBox = data
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
          icon = config.defaultIcon
        }
        const objIndex = this.programs.findIndex(obj => obj.id === data.id)
        this.programs[objIndex].icon = icon
        this.programs.push([])
        this.programs.pop()
      },
      getList () {
        const klawSync = require('klaw-sync')
        try {
          const url = (process.platform === 'win32') ? config.WindowsPath : config.LinuxPath
          this.allPrograms = klawSync(url, {nodir: true})
          this.allPrograms.forEach(element => {
            element.name = element.path.split('\\').pop().split('.')[0]
          })
        } catch (er) {
          console.error(er)
        }
      },
      dragOver (event) {
        event.target.style['outline-offset'] = '-5px'
      },
      dragLeave (event) {
        event.target.style['outline-offset'] = '-10px'
      }
    },
    watch: {
      numbers: function () {
        const initial = this.programs.length
        const diff = this.numbers - initial

        // if adding to array
        if (diff > 0) {
          for (let index = 0; index < diff; index++) {
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
      }
    },
    computed: {
      filteredList () {
        return this.allPrograms.filter(data => {
          return data.name.toLowerCase().includes(this.search.toLowerCase())
        })
      }
    }
  }

// Takes the URL and gets the Icon, for search box
Vue.component('programIcon', {
    data: function () {
      return {
        icon: '' // icon's base64 encoded value
      }
    },
    props: {
      url: '' // url path of the icon
    },
    mounted () {
      this.getIcon(this.url)
    },
    watch: {
      url: function (data) {
        this.icon = null
        this.getIcon(data)
      }
    },
    methods: {
      getIcon (data) {
        if (data.endsWith('.desktop')) {
          parser.parseDesktop(data)
            .then(response => {
              this.icon = response.icon
            })
        } else {
          if (data.endsWith('.lnk')) {
            try {
              data = shell.readShortcutLink(data).target
            } catch (error) {}
          }
          app.getFileIcon(data)
            .then(NativeImage => {
              this.icon = NativeImage.toDataURL()
            })
        }
      }
    },
    template: '<img style="background-image:none; max-width: 36px;" :src="icon">'
})
</script>

<style scoped>
/* source-sans-pro-regular - latin */
@font-face {
  font-family: "Source Sans Pro";
  font-style: normal;
  font-weight: 400;
  src: local("Source Sans Pro Regular"), local("SourceSansPro-Regular"),
    url("~@/assets/fonts/source-sans-pro-v13-latin-regular.woff2")
      format("woff2");
}

/* Scorllbar */
.scrollable {
  overflow-y: auto;
  height: 75vh;
}
.scrollable::-webkit-scrollbar-track {
  background-color: #F5F5F5;
  border-radius: 10px;
}
.scrollable::-webkit-scrollbar {
  width: 10px;
  background-color: #F5F5F5;
}
.scrollable::-webkit-scrollbar-thumb {
  background-color: #3366FF;
  border-radius: 10px;
  background-image: -webkit-linear-gradient(0deg,
    rgba(255, 255, 255, 0.5) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0.5) 75%,
    transparent 75%,
    transparent)
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
  -webkit-transition: 0.2s;
  transition: opacity 0.2s;
}

/* Mouse-over effects */
.slider:hover {
  opacity: 1;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  display: block;
  background: black;
  border-radius: 100%;
  width: 25px;
  height: 25px;
  margin: 0;
  background: radial-gradient(circle at 10px 10px, #5cabff, #000);
  cursor: pointer;
}

.program {
  border: solid rgb(0, 0, 255) thin;
  padding: 0px 5px 10px 5px;
  border-radius: 15px;
  overflow-wrap: break-word;
  min-height: 116px;
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
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
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
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
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

.box-input {
  min-height: 55px;
  outline: 2px dashed #92b0b3;
  outline-offset: -10px;
  transition: outline-offset .15s ease-in-out, background-color .15s linear;
  z-index: 2;
}
.inner-box {
  position: absolute;
  top: 54%;
  left: 34%;
  z-index: -1;
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
  padding: 0.1rem 1rem;
  border-radius: 25px;
  cursor: pointer;
}
.deleteProfile:hover {
  background: rgb(216, 216, 216);
}

.content:hover,
.content:focus {
  background-color: rgb(228, 228, 228);
  text-decoration: underline;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
}

.list:hover,
.list:focus {
  text-decoration: underline;
  box-shadow: 0px 8px 16px 0px rgba(255, 0, 0, 0.2);
  border-top: solid rgba(255, 0, 0, 0.39) 1px;
}

input {
  color: rgb(0, 0, 0);
}

img {
  padding: 0px 4px 5px 0px;
  border-radius: 15px;
}
/*light theme*/
@media screen and (prefers-color-scheme: light), screen and (prefers-color-scheme: no-preference) {
  img:hover,
  img:focus {
    background-image: radial-gradient(
      circle,
      rgb(62, 155, 244),
      rgba(146, 145, 145, 0)
    );
  }
}

/*dark theme*/
@media screen and (prefers-color-scheme: dark) {
  img:hover,
  img:focus {
    background-image: radial-gradient(
      circle,
      rgb(193, 193, 193),
      rgba(146, 145, 145, 0)
    );
  }
}

</style>
