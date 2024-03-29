<template>
  <div>
    <div
      id="wrapper"
      class="container-fluid"
    >
      <div class="row">
        <div class="btn-group pull-left firstButton">
          <button
            class="btn btn-default buttonHover"
            @click="showModal"
          >
            Save As
          </button>
          <button
            class="btn btn-default btn-dropdown buttonHover"
            @click="showDropdown = !showDropdown"
          >
            Profiles
          </button>
          <button
            class="btn btn-default buttonHover"
            @click="clearAll"
          >
            Reset
          </button>
        </div>
        <div class="dropdown">
          <div
            v-if="showDropdown"
            class="dropdown-content"
          >
            <div v-if="profiles.length == 0">
              No Profiles saved
            </div>
            <div
              v-for="profile in profiles"
              v-else
              :key="profile"
              class="content"
            >
              <button
                class="btn btn-mini btn-primary buttonPrimaryHover"
                @click="loadProfile(profile)"
              >
                {{ profile }}
              </button>
              <button
                class="btn btn-mini btn-default rename buttonHover"
                @click="renameProfile(profile)"
              >
                Rename
              </button>
              <span
                class="icon icon-cancel deleteProfile pull-right"
                @click="deleteProfile(profile)"
              />
              <hr>
            </div>
          </div>
        </div>
      </div>

      <div
        style="height: 100vh"
        @click="showDropdown = false"
      >
        <div class="row">
          How many programs: {{ numbers }}
          <div class="slidecontainer">
            <input
              v-model="numbers"
              type="range"
              min="1"
              max="40"
              value="5"
              class="slider"
            >
          </div>
        </div>
        <div class="row">
          <button
            class="btn btn-primary buttonPrimaryHover"
            @click="submit"
          >
            Start All Programs
          </button>
          <button
            class="btn btn-negative buttonNegative"
            @click="killProcesses"
          >
            Kill All programs
          </button>
        </div>
        <div class="row mt-1 scrollable">
          <div
            v-for="(program, index) in programs"
            :key="program.id"
          >
            <div
              v-if="index !== 0 && index % 4 === 0"
              class="row"
            />
            <div class="col-md-3 program">
              <div class="row">
                <div class="user-select">
                  Choose your program
                </div>
              </div>
              <div class="row">
                <div
                  class="btn-group"
                  style="margin-left: 10px"
                >
                  <file-ingest
                    :input="program"
                    @load="addUrl"
                  />
                  <button
                    class="btn btn-mini btn-default buttonHover"
                    @click="showSearch(program.id)"
                  >
                    <span
                      class="icon"
                      :class="[
                        whichTextBox == program.id
                          ? 'icon-up-open-big'
                          : 'icon-down-open-big',
                      ]"
                    />&nbsp; Search
                  </button>
                  <button
                    v-if="program.url"
                    class="btn btn-mini btn-default buttonHover tooltip"
                    @click="openOptions(program.id)"
                  >
                    <span class="icon icon-cog" />
                    <span class="tooltiptext">Add options to program</span>
                  </button>
                  <button
                    class="btn btn-mini btn-default buttonHover tooltip"
                    @click="ClearProgram(program.id)"
                  >
                    <span
                      style="color: red"
                      class="icon icon-cancel"
                    />Clear
                    <span class="tooltiptext">Clear program from grid</span>
                  </button>
                </div>
              </div>
              <div
                v-if="!program.url && whichTextBox != program.id"
                class="row"
              >
                <div
                  class="box-input"
                  @drop.prevent="addFile($event, program.id)"
                  @dragenter.prevent
                  @dragover.prevent="dragOver"
                  @dragleave="dragLeave"
                >
                  <div class="inner-box">
                    Drag and Drop
                  </div>
                </div>
              </div>
              <div
                v-if="whichTextBox == program.id"
                class="row"
              >
                <form>
                  <div class="form-group mt-1">
                    <label for="pofileName">Search Program</label>
                    <input
                      id="pofileName"
                      v-model="search"
                      v-focus
                      type="text"
                      class="form-control"
                      placeholder="Outlook"
                    >
                  </div>
                </form>
                <div v-if="search && whichTextBox == program.id">
                  <div
                    v-for="(post, index1) in filteredList.slice(0, 10)"
                    :key="post + index1"
                    class="card"
                  >
                    <div
                      class="row list"
                      @click="addUrl({ id: program.id, url: post.path })"
                    >
                      <div class="col-md-6">
                        <programIcon :url="post.path" />
                      </div>
                      <div class="col-md-6">
                        <div style="margin-top: 5px">
                          {{ post.name }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-if="program.url"
                class="row-no-gutters small"
              >
                <br>
                <div class="col-md-2">
                  <img
                    v-if="program.icon"
                    style="max-width: 36px;'"
                    class="pull-left"
                    :src="program.icon"
                    alt="Programs Icon"
                    @click="openSingle(program.url, program.options)"
                  >
                </div>
                <div
                  :id="program.url"
                  :ref="program.url"
                  class="col-md-10"
                >
                  {{ program.url }} &nbsp; {{ program.options }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <modal
        v-show="isModalVisible"
        :reset="isModalVisible"
        :old-name="oldName"
        :options-index="optionsIndex"
        @close="closeModal"
        @addOptions="addOptions"
      />
    </div>
  </div>
</template>

<script>
import FileIngest from "./LandingPage/FileIngest";
import Modal from "./LandingPage/Modal.vue";
import Vue from "vue";
import path from "path";
import config from "../assets/config";
import parser from "../services/linuxparse";
const { shell, ipcRenderer } = require("electron");
const appr = require("@electron/remote").app;
const number = 5; // cheating with global number so it can be reused

class Program {
  constructor (id, url, options, icon) {
    this.id = id;
    this.url = url || "";
    this.options = options || "";
    this.icon = icon || "";
  }
}

// eslint-disable-next-line vue/one-component-per-file
export default {
  name: "LandingPage",
  components: { FileIngest, Modal },
  directives: {
    focus: {
      inserted: function (el) {
        el.focus();
      }
    }
  },
  data: () => ({
    isModalVisible: false, // toggles visibility of the Save As modal
    whichTextBox: null, // Program.id to render text box for search input
    profiles: [], // array of user profiles
    numbers: number, // default number of program boxes
    showDropdown: false, // toggles the profile picker dropdown
    allSettings: {}, // object of all user settings
    oldName: null, // old profile name when renaming profile
    allPrograms: [], // array of applications found on default location
    search: "", // string to filter 'allPrograms' by
    searchId: 0, // which instnace of the 'programs' object is searching for an application
    optionsIndex: null, // which program to add an options object to
    programs: Array(number)
      .fill(null)
      .map((_, i) => new Program(i + 1)) // array Program
  }),
  computed: {
    filteredList () {
      return this.allPrograms.filter((data) => {
        return data.name.toLowerCase().includes(this.search.toLowerCase());
      });
    }
  },
  watch: {
    numbers: function () {
      const initial = this.programs.length;
      const diff = this.numbers - initial;

      // if adding to array
      if (diff > 0) {
        for (let index = 0; index < diff; index++) {
          this.programs.push(new Program(initial + (index + 1)));
        }
      }

      // if removing from array
      if (diff < 0) {
        for (let index = 0; index < Math.abs(diff); index++) {
          this.programs.pop();
        }
      }
    }
  },
  mounted () {
    this.getProfiles();
    this.getList();
  },
  methods: {
    /** Gets all profiles from system settings */
    async getProfiles () {
      this.allSettings = await ipcRenderer.invoke("get-settings");
      if (this.allSettings) {
        Object.entries(this.allSettings).forEach(([key, _value]) =>
          this.profiles.push(key)
        );
      }
    },
    /** Populates display with saves program list */
    loadProfile (profile) {
      this.showDropdown = false;
      this.programs = [...this.allSettings[profile]];
      this.numbers = this.programs.length;
      this.removeAllErrors();

      this.programs.forEach((element) => {
        if (!element.icon) {
          this.getImage(element);
        }
      });
    },
    /** Deletes a profile from settings */
    async deleteProfile (profile) {
      await ipcRenderer.invoke("delete-profile", profile);
      this.profiles = [];
      this.showDropdown = false;
      this.getProfiles();
    },
    /** Triggers modal for profile renaming */
    renameProfile (profile) {
      this.oldName = profile;
      this.showModal();
    },
    /** Clears whole display */
    clearAll () {
      this.numbers = number;
      this.programs = Array(number)
        .fill(null)
        .map((_, i) => new Program(i + 1));
    },
    /** Adds app location to program array */
    addUrl (data) {
      // if Windows shortcut
      if (data.url.endsWith(".lnk")) {
        try {
          data.url = shell.readShortcutLink(data.url).target;
        } catch (error) {
          // do nothing
        }
      }

      // if Linux shortcut
      if (data.url.endsWith(".desktop")) {
        this.processLinux(data);
      } else {
        const objIndex = this.programs.findIndex((obj) => obj.id === data.id);
        this.programs[objIndex].url = data.url;
        this.getImage(data);
      }
      this.whichTextBox = null;
    },
    /** Gets program name from `.desktop` shortcut */
    async processLinux (data) {
      const objIndex = this.programs.findIndex((obj) => obj.id === data.id);
      const parsed = await parser.parseDesktop(data.url);
      const temp = this.programs[objIndex];
      temp.url = parsed.url;
      temp.icon = parsed.icon;
      this.programs.splice(objIndex, 1, temp);
    },
    /** Triggered on drop event to add file to list */
    addFile (event, id) {
      if (event.dataTransfer.files[0]) {
        this.addUrl({ id: id, url: event.dataTransfer.files[0].path });
      }
    },
    /** Starts all programs in view */
    submit () {
      this.programs.forEach((element) => {
        if (element.url) {
          this.openSingle(element.url, element.options);
        }
      });
    },
    /** Opens individual program */
    openSingle (url, options) {
      // if windows, surround in double quotes
      if (process.platform === "win32") {
        url = `"${url}"`;
      }
      // if options exists, append to program
      if (options !== undefined) {
        url = `${url} ${options}`;
      }
      this.clearError(url);
      const { exec } = require("child_process");
      const script = exec(url, (err, _stdout, _stderr) => {
        if (err) {
          // manually add error to DOM;
          // Don't want to polute the Program class
          console.error(`exec error: ${err}`);
          let program = url.trim();
          program = program.replace(/"/g, "");
          const para = document.createElement("p");
          const node = document.createTextNode(err);
          para.appendChild(node);
          para.setAttribute("class", "error");
          para.setAttribute("style", "color: rgb(255, 0, 0);");
          this.$refs[program][0].appendChild(para);
          // document.getElementById(program).appendChild(para)
        }
      });
      // after three seconds, kill process, and remove listner
      // otherwise, when process is killed, an `err` is emmitted
      setTimeout(function () {
        script.stdout.removeAllListeners();
        script.stdin.pause();
        script.kill();
      }, 3000);
    },
    /** Clears a single program box */
    ClearProgram (id) {
      this.search = null;
      const objIndex = this.programs.findIndex((obj) => obj.id === id);
      const prgm = this.programs[objIndex].url;

      this.clearError(prgm);
      const temp = new Program(this.programs[objIndex].id);
      this.programs.splice(objIndex, 1, temp);
    },
    /** Manually updates DOM to clear any error elements */
    clearError (data) {
      let program = data.trim();
      program = program.replace(/"/g, "");
      const node = document.getElementById(program);
      if (node) {
        const error = node.getElementsByClassName("error");
        // loops through all error divs and removes them (in case there are more than one)
        while (error.length > 0) {
          const element = error[0];
          element.parentNode.removeChild(element);
        }
      }
    },
    /** Removes all .error divs from DOM */
    removeAllErrors () {
      const errors = document.getElementsByClassName("error");
      while (errors.length > 0) {
        const element = errors[0];
        element.parentNode.removeChild(element);
      }
    },
    showModal () {
      this.isModalVisible = true;
      this.showDropdown = false;
      this.optionsIndex = null;
    },
    /** Upon modal closal event, update profile list */
    async closeModal (data) {
      this.isModalVisible = false;
      this.oldName = null;
      if (data) {
        // if renaming existing profile
        if (data.old) {
          const temp = this.allSettings[data.old];
          // settings.setSync(data.new, temp)
          await ipcRenderer.invoke("set-profile", data.new, temp);
          this.deleteProfile(data.old);

          // if saving new profile
        } else if (data.new) {
          // settings.setSync(data.new, this.programs)
          await ipcRenderer.invoke("set-profile", data.new, this.programs);
          this.profiles = [];
          this.getProfiles();
        }
      }
    },
    /** Add a startup option to the program object */
    addOptions (data) {
      this.isModalVisible = false;
      if (data) {
        const objIndex = this.programs.findIndex((obj) => obj.id === data.id);
        const temp = this.programs[objIndex];
        temp.options = data.text;
        this.programs.splice(objIndex, 1, temp);
      }
    },
    /** Opens the options modal */
    openOptions (id) {
      this.optionsIndex = id;
      this.isModalVisible = true;
    },
    /** Toggles the searh form */
    showSearch (data) {
      this.search = null;
      if (this.whichTextBox === data) {
        this.whichTextBox = null;
      } else {
        this.whichTextBox = data;
      }
    },
    /**
     * Gets an app's icon from its file.
     * Then sets the icon as a base64 string as a property of the program
     */
    async getImage (data) {
      let icon;
      try {
        const NativeImage = await appr.getFileIcon(path.normalize(data.url));
        icon = NativeImage.toDataURL();

        // sets a default icon
      } catch (error) {
        icon = config.defaultIcon;
      }
      const objIndex = this.programs.findIndex((obj) => obj.id === data.id);
      const temp = this.programs[objIndex];
      temp.icon = icon;
      this.programs.splice(objIndex, 1, temp);
    },
    /** Gets list of all programs to search through */
    getList () {
      const klawSync = require("klaw-sync");
      try {
        const url =
          process.platform === "win32" ? config.WindowsPath : config.LinuxPath;
        this.allPrograms = klawSync(url, { nodir: true });
        this.allPrograms.forEach((element) => {
          element.name = element.path.split("\\").pop().split(".")[0];
        });
      } catch (er) {
        console.error(er);
      }
    },
    /** Adds style for drag even */
    dragOver (event) {
      event.target.style["outline-offset"] = "-5px";
    },
    /** Resets style when drag even ends */
    dragLeave (event) {
      event.target.style["outline-offset"] = "-10px";
    },
    /** Kills all processes current in display */
    killProcesses () {
      const { exec } = require("child_process");

      this.programs.forEach((element) => {
        if (element.url) {
          const splitted = element.url.split("\\");
          const last = splitted[splitted.length - 1];

          this.clearError(element.url);

          // main execution of command
          exec(this.getCommand(last), (error, stdout, _stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);

              // gets a more human friendly section of Error object
              const str = error.toString();
              const errArray = str.split(/\n/, 3);
              const text = errArray.length > 2 ? errArray[1] : error;

              const para = document.createElement("p");
              const node = document.createTextNode(text);
              para.appendChild(node);
              para.setAttribute("class", "error");
              para.setAttribute("style", "color: rgb(255, 0, 0);");

              let program = element.url.trim();
              program = program.replace(/"/g, "");
              this.$refs[program][0].appendChild(para);
              return;
            }

            if (stdout) {
              console.log(`stdout: ${stdout}`);
            }
          });
        }
      });
    },
    /** Gets task skill string based off of operating system */
    getCommand (program) {
      if (process.platform === "win32") {
        return `TASKKILL /IM ${program} /F`;
      } else {
        return `pkill -f '${program}'`;
      }
    }
  }
};

// Takes the URL and gets the Icon, for search box
// eslint-disable-next-line vue/one-component-per-file
Vue.component("ProgramIcon", {
  props: {
    url: {
      type: String,
      default: ""
    } // url path of the icon
  },
  data: function () {
    return {
      icon: "" // icon's base64 encoded value
    };
  },
  watch: {
    url: function (data) {
      this.icon = null;
      this.getIcon(data);
    }
  },
  mounted () {
    this.getIcon(this.url);
  },
  methods: {
    getIcon (data) {
      if (data.endsWith(".desktop")) {
        parser.parseDesktop(data).then((response) => {
          this.icon = response.icon;
        });
      } else {
        if (data.endsWith(".lnk")) {
          try {
            data = shell.readShortcutLink(data).target;
          } catch (error) {
            // do nothing
          }
        }
        appr.getFileIcon(data).then((NativeImage) => {
          this.icon = NativeImage.toDataURL();
        });
      }
    }
  },
  template: "<img style=\"background-image:none; max-width: 36px;\" :src=\"icon\">"
});
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
  user-select: none;
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
  background: radial-gradient(
    circle at 10px 10px,
    rgb(92, 171, 255),
    rgb(0, 0, 0)
  );
  cursor: pointer;
}

.program {
  border: solid rgb(0, 0, 255) thin;
  padding: 0px 5px 10px 5px;
  border-radius: 15px;
  overflow-wrap: break-word;
  min-height: 116px;
}

.buttonNegative {
  margin-left: 2rem;
}
.buttonNegative:hover {
  background-image: linear-gradient(to bottom, #fc6c67 0, #fd1008 100%);
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
.thirdButton {
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

.error {
  color: rgb(255, 0, 0);
  margin-top: 0.2rem;
  font-style: italic;
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

/* The snackbar - position it at the bottom and in the middle of the screen */
#snackbar {
  visibility: hidden;
  min-width: 250px;
  margin-left: -125px;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 2px;
  padding: 16px;
  position: fixed;
  z-index: 1;
  left: 50%;
  bottom: 30px;
}

#snackbar.show {
  visibility: visible;
  -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
  animation: fadein 0.5s, fadeout 0.5s 2.5s;
}
@-webkit-keyframes fadein {
  from {
    bottom: 0;
    opacity: 0;
  }
  to {
    bottom: 30px;
    opacity: 1;
  }
}
@keyframes fadein {
  from {
    bottom: 0;
    opacity: 0;
  }
  to {
    bottom: 30px;
    opacity: 1;
  }
}
@-webkit-keyframes fadeout {
  from {
    bottom: 30px;
    opacity: 1;
  }
  to {
    bottom: 0;
    opacity: 0;
  }
}
@keyframes fadeout {
  from {
    bottom: 30px;
    opacity: 1;
  }
  to {
    bottom: 0;
    opacity: 0;
  }
}
</style>
