<template>
  <div class="container">
    <div class="content-body">
      <HeaderBig>Welcome to VCT Tools</HeaderBig>
      <p>
        Please select what this installation will be used for.
      </p>
      <div class="tabs-container">
        <div :class="`tab ${selectedTab === 0 ? `selected` : ``}`" @click="selectedTab = 0">
          SERVER
        </div>
        <div :class="`tab ${selectedTab === 1 ? `selected` : ``}`" @click="selectedTab = 1">
          CLIENT
        </div>
      </div>

      <div class="tabs-content" v-if="selectedTab == 0">
        <UILargeButton @click="openLoginScreen()">
          LOGIN
        </UILargeButton>
        <p>You will be asked to connect your Riot account with VCT Tools.</p>
        <p>By creating a VCT Tools account, you agree to our <a href="https://vcttools.net/terms_of_service">Terms of Service</a> and <a href="https://vcttools.net/privacy">Privacy Policy</a>.</p>
      </div>

      <div class="tabs-content" v-if="selectedTab == 1">
        <UIField></UIField>
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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tabs-container {
  color: #6b7476;

  font-size: 10pt;

  display: flex;
}

.tabs-container .tab {
  padding: 5px 50px;
  cursor: pointer;
  border-bottom: 1px solid #6b7476;
}

.tabs-container .tab.selected {
  border-bottom: 4px solid #04ca8f;
  position: relative;
  color: #04ca8f;
}

.tabs-container .tab.selected::after {
  content: "";
  background: url(@/assets/images/tab_selected.png);
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;

  width: 20px;
  height: 20px;

  position: absolute;

  top: 21px;
  left: 50%;
  transform: translateX(-50%);
}

.info {
  border: 1px solid #6b7476;
  background-color: #54758142;

  padding: 5px;
  width: 100%;
  max-width: 500px;

  margin-bottom: 30px;

  text-align: center;
}

.tabs-content {
  width: 70%;
  margin-top: 30px;

  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;
}
</style>

<script setup lang="ts">
import HeaderBig from "./components/HeaderBig.vue";
import { ref } from "vue";
import { UIField, UILargeButton } from "vct-tools-components";

const selectedTab = ref(0);

const openLoginScreen = () => {
  const w = window.open("https://auth.riotgames.com/authorize?redirect_uri=https://api.vcttools.net/v1/rso_flow/login_callback&client_id=65ff0b1c-e14f-4994-8164-5dd4c086d7ae&response_type=code&scope=openid+offline_access", "_blank");
  if (w) {
    w.addEventListener("message", (event) => {

    });
  }
};
</script>
