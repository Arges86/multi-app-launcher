<template>
  <transition name="modal-fade">
    <div class="modal-backdrop">
      <div
        class="modal"
        role="dialog"
        aria-labelledby="modalTitle"
        aria-describedby="modalDescription"
        style="position: relative"
      >
        <!-- For Options dialog -->
        <span v-if="optionsIndex">
          <header
            id="modalTitle"
            class="modal-header"
          >
            Add options arguments &nbsp;
            <span
              class="icon icon-cancel close-button"
              @click="close"
            />
          </header>
          <section
            id="modalDescription"
            class="modal-body"
          >
            <form>
              <div class="form-group">
                <label for="options">Options</label>
                <input
                  id="options"
                  ref="options"
                  v-model="optionsText"
                  v-focus
                  type="text"
                  class="form-control"
                  placeholder="-private-window"
                  @keyup.enter="addOptions"
                >
              </div>
            </form>
            <button
              class="btn btn-primary pull-right"
              :disabled="!optionsText"
              @click="addOptions"
            >
              Add
            </button>
          </section>
        </span>

        <!-- For profile dialog -->
        <span v-else>
          <header
            id="modalTitle"
            class="modal-header"
          >
            <span v-if="oldName">Rename {{ oldName }} to:</span>
            <span v-else>Save Profile As:</span>
            <span
              class="icon icon-cancel close-button"
              @click="close"
            />
          </header>
          <section
            v-if="reset"
            id="modalDescription"
            class="modal-body"
          >
            <form>
              <div class="form-group">
                <label for="pofileName">Pofile Name</label>
                <input
                  id="pofileName"
                  ref="pofileName"
                  v-model="name"
                  v-focus
                  type="text"
                  class="form-control"
                  placeholder="Work Profile"
                  @keydown.enter="save"
                >
              </div>
            </form>
            <button
              class="btn btn-primary pull-right"
              :disabled="!name"
              @click="save"
            >
              Save
            </button>
          </section>
        </span>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "Modal",
  directives: {
    focus: {
      inserted: function (el) {
        el.focus();
      }
    }
  },
  props: {
    oldName: {
      type: String,
      default: ""
    }, // If renaming profile, this is the existing name
    reset: {
      type: Boolean,
      required: false,
      default: false
    }, // boolean value to nullify form so its blank
    optionsIndex: {
      type: Number,
      default: null
    } // which program to add an options object to
  },
  data: () => ({
    name: "", // user inputed name
    optionsText: "" // user inputed options arguments
  }),
  watch: {
    reset: function () {
      this.name = null;
      this.optionsText = null;
    }
  },
  methods: {
    close (event) {
      event.preventDefault();
      this.$emit("close");
    },
    save (event) {
      console.log(event);
      event.preventDefault();
      if (this.name) {
        this.$emit("close", { new: this.name, old: this.oldName });
      }
    },
    addOptions (event) {
      event.preventDefault();
      if (this.optionsText) {
        this.$emit("addOptions", {
          id: this.optionsIndex,
          text: this.optionsText
        });
      }
    }
  }
};
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
  padding: 8px 0px 2px;
  display: flex;
}

.close-button {
  padding: 5px 12px;
  position: absolute;
  right: 0rem;
  top: 0rem;
}
.close-button:hover {
  color: rgb(255, 0, 0);
  background-color: rgba(211, 211, 211, 0.65);
}

.modal-header {
  border-bottom: 1px solid rgb(238, 238, 238);
  color: #4aae9b;
  justify-content: space-between;
}

#modalTitle {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
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
