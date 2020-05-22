<template>
  <div>
    <div class="container-fluid" id="wrapper">
      <div class="row">
        <div class="btn-group pull-left firstButton">
          <button class="btn btn-default buttonHover" @click="showModal">Save As</button>
            <button
              class="btn btn-default btn-dropdown buttonHover"
              @click="showDropdown = !showDropdown"
            >Profiles</button>
          <button class="btn btn-default buttonHover" @click="clearAll">Clear</button>
        </div>
        <div class="dropdown">
          <div class="dropdown-content" v-if="showDropdown">
            <div v-if="profiles.length == 0">No Profiles saved</div>
            <div v-else class="content" v-for="profile in profiles" :key="profile">
              <button
                @click="loadProfile(profile)"
                class="btn btn-mini btn-primary buttonPrimaryHover"
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
            <input type="range" min="1" max="40" value="5" class="slider" v-model="numbers" />
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
                <div class="btn-group" style="margin-left: 10px;">
                  <file-ingest @load="addUrl" :input="program"></file-ingest>
                  <button
                    class="btn btn-mini btn-default buttonHover"
                    @click="showSearch(program.id)"
                  >
                    <span
                      class="icon"
                      :class="[whichTextBox == program.id ? 'icon-up-open-big' : 'icon-down-open-big']"
                    ></span>&nbsp; Search
                  </button>
                  <button
                    class="btn btn-mini btn-default buttonHover tooltip"
                    @click="openOptions(program.id)"
                    v-if="program.url"
                  >
                    <span class="icon icon-cog"></span>
                    <span class="tooltiptext">Add options to program</span>
                  </button>
                  <button
                    class="btn btn-mini btn-default buttonHover tooltip"
                    @click="ClearProgram(program.id)"
                  >
                    <span style="color: red;" class="icon icon-cancel"></span>Clear
                    <span class="tooltiptext">Clear program from grid</span>
                  </button>
                </div>
              </div>
              <div class="row" v-if="!program.url && whichTextBox != program.id">
                <div
                  class="box-input"
                  @drop.prevent="addFile($event, program.id)"
                  @dragenter.prevent
                  @dragover.prevent="dragOver"
                  @dragleave="dragLeave"
                >
                  <div class="inner-box">Drag and Drop</div>
                </div>
              </div>
              <div class="row" v-if="whichTextBox == program.id">
                <form>
                  <div class="form-group mt-1">
                    <label for="pofileName">Search Program</label>
                    <input
                      type="text"
                      id="pofileName"
                      class="form-control"
                      placeholder="Outlook"
                      v-focus
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
                    @click="openSingle(program.url, program.options)"
                    v-if="program.icon"
                    style="max-width: 36px;'"
                    class="pull-left"
                    :src="program.icon"
                    alt="Programs Icon"
                  />
                </div>
                <div class="col-md-10">{{program.url}} &nbsp; {{program.options}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <modal
        v-show="isModalVisible"
        :reset="isModalVisible"
        :oldName="oldName"
        :optionsIndex="optionsIndex"
        @close="closeModal"
        @addOptions="addOptions"
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
  const exec = require('child_process').exec
  const number = 5 // cheating with global number so it can be reused

  class Program {
    constructor (id, url, options, icon) {
      this.id = id
      this.url = url || ''
      this.options = options || ''
      this.icon = icon || ''
    }
  }

  export default {
    name: 'landing-page',
    components: { FileIngest, Modal },
    data: () => ({
      isModalVisible: false, // toggles visibility of the Save As modal
      whichTextBox: null, // Program.id to render text box for search input
      profiles: [], // array of user profiles
      numbers: number, // default number of program boxes
      showDropdown: false, // toggles the profile picker dropdown
      allSettings: {}, // object of all user settings
      oldName: null, // old profile name when renaming profile
      allPrograms: [], // array of applications found on default location
      search: '', // string to filter 'allPrograms' by
      searchId: 0, // which instnace of the 'programs' object is searching for an application
      optionsIndex: null, // which program to add an options object to
      programs: Array(number).fill(null).map((_, i) => new Program(i + 1)) // array Program
    }),
    mounted () {
      this.getProfiles()
      this.getList()
      console.log(this.programs)
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
        this.programs = [...this.allSettings[profile]]
        this.numbers = this.programs.length

        this.programs.forEach(element => {
          if (!element.icon) {
            this.getImage(element)
          }
        })
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
      clearAll () {
        this.numbers = number
        this.programs = Array(number).fill(null).map((_, i) => new Program(i + 1))
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
        this.programs.forEach(element => {
          if (element.url) {
            this.openSingle(element.url, element.options)
          }
        })
      },
      openSingle (url, options) {
        // if windows, surround in double quotes
        if (process.platform === 'win32') {
          url = `"${url}"`
        }
        // if options exists, append to program
        if (options !== undefined) {
          url = `${url} ${options}`
        }
        exec(url, (err, stdout, stderr) => {
          if (err) {
            console.error(`exec error: ${err}`)
          }
        })
      },
      ClearProgram (id) {
        this.search = null
        const objIndex = this.programs.findIndex(obj => obj.id === id)
        const temp = new Program(this.programs[objIndex].id)
        this.programs.splice(objIndex, 1, temp)
      },
      showModal () {
        this.isModalVisible = true
        this.showDropdown = false
        this.optionsIndex = null
      },
      closeModal (data) {
        console.log(data)
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
      addOptions (data) {
        this.isModalVisible = false
        if (data) {
          const objIndex = this.programs.findIndex(obj => obj.id === data.id)
          const temp = this.programs[objIndex]
          temp.options = data.text
          this.programs.splice(objIndex, 1, temp)
        }
      },
      openOptions (id) {
        this.optionsIndex = id
        this.isModalVisible = true
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
        const temp = this.programs[objIndex]
        temp.icon = icon
        this.programs.splice(objIndex, 1, temp)
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
            this.programs.push(new Program(initial + (index + 1)))
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
    },
    directives: {
      focus: {
        inserted: function (el) {
          el.focus()
        }
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

/* Scrollbar */
.scrollable {
  overflow-y: auto;
  overflow-x: hidden;
  height: 75vh;
  display: list-item; /* this seems to allow the tooltip to not get cliped on the top row */
}
.scrollable::-webkit-scrollbar-track {
  background-color: rgb(245, 245, 245);
  border-radius: 10px;
}
.scrollable::-webkit-scrollbar {
  width: 10px;
  background-color: rgb(245, 245, 245);
}
.scrollable::-webkit-scrollbar-thumb {
  background-color: rgb(51, 102, 255);
  border-radius: 10px;
  background-image: -webkit-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.5) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0.5) 75%,
    transparent 75%,
    transparent
  );
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
  background: rgb(211, 211, 211);
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
  background: rgb(0, 0, 0);
  border-radius: 100%;
  width: 25px;
  height: 25px;
  margin: 0;
  background: radial-gradient(circle at 10px 10px, rgb(92, 171, 255), rgb(0, 0, 0));
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
  top: 0.3rem;
  left: 2.2rem;
  position: absolute;
}
.secondButton {
  position: absolute;
  top: 0.3rem;
  left: 5.6rem;
}
.thirdButton{
  position: absolute;
  top: 0.3rem;
  left: 9.7rem;
}

.dropdown-content-hide {
  display: none;
  position: absolute;
  top: -8px;
  left: 42px;
  background-color: rgb(249, 249, 249);
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  padding: 12px 16px;
  z-index: 1;
}

.dropdown-content {
  display: block;
  position: absolute;
  top: 1.8rem;
  left: 5.6rem;
  background-color: rgb(249, 249, 249);
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
  outline: 2px dashed rgb(146, 176, 179);
  outline-offset: -10px;
  transition: outline-offset 0.15s ease-in-out, background-color 0.15s linear;
  z-index: 2;
}
.inner-box {
  position: absolute;
  top: 52%;
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
  color: rgb(255, 0, 0);
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
  /* text-decoration: underline; */
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
@media screen and (prefers-color-scheme: light),
  screen and (prefers-color-scheme: no-preference) {
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
