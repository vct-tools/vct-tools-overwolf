<template>
  <div class="container">
    <div class="content-body">
      <div class="content-body-content">
        <div class="panel-1">
          <header-small>Customize overlay</header-small>
          <div class="panel-content">
            <OverlayOptionsPanel v-model="overlayOptions"></OverlayOptionsPanel>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;
}

.content-body {
  width: 90vw;
  font-size: 12pt;

  display: flex;
}

.content-body-content {
  flex: 1;

  display: flex;
  flex-direction: column;
}

.sidebar-right {
  width: 200px;
  display: flex;
  flex-direction: column;

  margin-left: 1em;
}

.sidebar-right-wrapper {
  border: 1px solid #6b7476;
  flex: 1;

  display: flex;
  flex-direction: column;
}

.match-list {
  flex: 1;
}

.panel-1 {
  flex: 1;

  display: flex;
  flex-direction: column;
}

.panel-content {
  flex: 1;
}
</style>

<script setup lang="ts">
import HeaderSmall from "./components/HeaderSmall.vue";

import { ref } from "vue";
import OverlayOptionsPanel from "./components/OverlayOptionsPanel.vue";
import { createDefaultOverlaySettings } from "./overlayType";

const overlayOptions = ref(createDefaultOverlaySettings());
</script>
