<template>
  <transition name="modal-fade">
    <div class="modal-backdrop">
      <div
        class="modal"
        role="dialog"
        aria-labelledby="modalTitle"
        aria-describedby="modalDescription"
        style="position: relative;"
      >
        <!-- For Options dialog -->
        <span v-if="optionsIndex">
          <header class="modal-header" id="modalTitle">
            Add options arguments &nbsp;
            <span @click="close" class="icon icon-cancel close-button"></span>
          </header>
          <section class="modal-body" id="modalDescription">
            <form>
              <div class="form-group">
                <label for="options">Options</label>
                <input
                  type="text"
                  class="form-control"
                  id="options"
                  ref="options"
                  placeholder="-private-window"
                  v-model="optionsText"
                  @keyup.enter="addOptions"
                  v-focus
                />
              </div>
            </form>
            <button
              class="btn btn-primary pull-right"
              :disabled="!optionsText"
              @click="addOptions"
            >Add</button>
          </section>
        </span>

        <!-- For profile dialog -->
        <span v-else>
          <header class="modal-header" id="modalTitle">
            <span v-if="oldName">Rename {{oldName}} to:</span>
            <span v-else>Save Profile As:</span>
            <span @click="close" class="icon icon-cancel close-button"></span>
          </header>
          <section class="modal-body" id="modalDescription" v-if="reset">
            <form>
              <div class="form-group">
                <label for="pofileName">Pofile Name</label>
                <input
                  type="text"
                  id="pofileName"
                  class="form-control"
                  ref="pofileName"
                  placeholder="Profile1"
                  v-model="name"
                  @keyup.enter="save"
                  v-focus
                />
              </div>
            </form>
            <button
              class="btn btn-primary pull-right" 
              :disabled="!name" 
              @click="save"
              >Save</button>
          </section>
        </span>
      </div>
    </div>
  </transition>
</template>

<script>

export default {
  name: 'modal',
  props: {
    oldName: '', // If renaming profile, this is the existing name
    reset: false, // boolean value to nullify form so its blank
    optionsIndex: '' // which program to add an options object to
  },
  data: () => ({
    name: '', // user inputed name
    optionsText: '' // user inputed options arguments
  }),
  watch: {
    reset: function (data) {
      this.name = null
      this.optionsText = null
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    save () {
      if (this.name) {
        this.$emit('close', {new: this.name, old: this.oldName})
      }
    },
    addOptions () {
      if (this.optionsText) {
        this.$emit('addOptions', {id: this.optionsIndex, text: this.optionsText})
      }
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
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: #ffffff;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
}

.modal-header,
.modal-footer {
  padding: 15px;
  display: flex;
}

.close-button {
  padding: 9px 16px;
  position: absolute;
  right: 0rem;
  top: 0rem;
}
.close-button:hover {
  color: rgb(255, 0, 0);
  background-color: rgba(211, 211, 211, 0.65);
  border-radius: 11px 0px 11px 15px;
}

.modal-header {
  border-bottom: 1px solid rgb(238, 238, 238);
  color: #4aae9b;
  justify-content: space-between;
}

.modal-footer {
  border-top: 1px solid rgb(238, 238, 238);
  justify-content: flex-end;
}

.modal-fade-enter,
.modal-fade-leave-active {
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.5s ease;
}

.modal-body {
  position: relative;
  padding: 20px 10px 40px 10px;
}
label,
input {
  color: rgb(0, 0, 0);
}
</style>
