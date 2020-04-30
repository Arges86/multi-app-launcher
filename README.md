# Mult App Launcher

> Multi App Launcher for Windows

This is a small [electron](https://www.electronjs.org/) application that allows up to 20 applications to be launched simultaneously.  
Profile can be saved so each day you don't have to open each application one at a time.

### Usage
App is currently Windows only (requires powershell).  
Once installed, can load up to 20 app shortcuts to start.  
Profile is saved in `%APPDATA%/<Your App>`.  

### How it works
On launch it loads the profile from save (if it exists).  
Once run, it calls the Powershell command `Start-Process -FilePath <PathToFile>` to launch program.  


### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

# lint all JS/Vue component files in `src/`
npm run lint

```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[45a3e22](https://github.com/SimulatedGREG/electron-vue/tree/45a3e224e7bb8fc71909021ccfdcfec0f461f634) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
