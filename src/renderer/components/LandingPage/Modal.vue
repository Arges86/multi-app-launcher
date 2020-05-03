<template>
  <transition name="modal-fade">
    <div class="modal-backdrop">
      <div
        class="modal"
        role="dialog"
        aria-labelledby="modalTitle"
        aria-describedby="modalDescription"
      >
        <header class="modal-header" id="modalTitle">
          <span v-if="oldName">Rename {{oldName}} to:</span>
          <span v-else>Save Profile As:</span>
          <span @click="close" class="icon icon-cancel"></span>
        </header>
        <section class="modal-body" id="modalDescription">
          <form>
            <div class="form-group">
              <label for="pofileName">Pofile Name</label>
              <input type="text" id="pofileName" class="form-control" placeholder="Profile1" v-model="name"/>
            </div>
          </form>
          <button class="btn btn-primary pull-right" @click="save">Save</button>
        </section>
      </div>
    </div>
  </transition>
</template>

<script>

export default {
  name: 'modal',
  props: {
    oldName: ''
  },
  data: () => ({
    name: ''
  }),
  methods: {
    close () {
      this.$emit('close')
    },
    save () {
      this.$emit('close', {new: this.name, old: this.oldName})
    }
  }
}
</script>

<style>
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

.modal-header {
  border-bottom: 1px solid rgb(238, 238, 238);
  color: #4aae9b;
  justify-content: space-between;
}

.modal-footer {
  border-top: 1px solid rgb(238, 238, 238);
  justify-content: flex-end;
}

.modal-fade-enter, .modal-fade-leave-active {
  opacity: 0;
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity .5s ease
}

.modal-body {
  position: relative;
  padding: 20px 10px;
}
label, input {
  color: rgb(0, 0, 0);
}
</style>
