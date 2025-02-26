<template>
  <UIDialogBox
    header="Consent"
    v-model="requestConsentScreen"
    accept-button-text="Accept"
    @accept="agreedToTerms = true"
  >
    <div style="text-align: center">
      Please read and agree to the
      <a href="https://vcttools.net/terms_of_service" target="_blank">Terms of Service</a> and
      <a href="https://vcttools.net/privacy" target="_blank">Privacy Policy</a> before continuing.
      <br /><br />
      By clicking "Accept", you agree to the Terms of Service and Privacy Policy.
    </div>
  </UIDialogBox>

  <div class="container">
    <div class="left">
      <HeaderBig>Welcome to VCT Tools</HeaderBig>
      <span v-if="agreedToTerms == false"
        >We'll help you get started. Click "Continue" when you're ready.</span
      >
      <span v-if="agreedToTerms">Next, you'll need to fill in the tournament information.</span>

      <UILargeButton
        style="margin-top: 5em"
        @click="requestConsentScreen = true"
        v-if="agreedToTerms == false"
        >Continue</UILargeButton
      >
      <UILargeButton
        style="margin-top: 5em"
        :disabled="!valid.v"
        :disabled-label="valid.m"
        v-if="agreedToTerms == true"
        >Finish</UILargeButton
      >
    </div>
    <div class="right">
      <div class="panel-1" v-if="!agreedToTerms">
        <div class="s" data-number="!">
          If you are a tournament organizer who wants to create a tournament, please visit
          VCTTools.net in your web browser.
        </div>
        <div class="s" data-number="1">
          The tournament organizer will provide you with a code, username and password.
        </div>
        <div class="s" data-number="2">
          You will also need to specify the server location. You may need to enter an IP address or
          select a server from the list.
        </div>
        <div class="s" data-number="3">
          You won't need to sign up for an account. Only the tournament organizer has to identify
          themselves.
        </div>
      </div>
      <div class="panel-2" v-if="agreedToTerms">
        <div class="s">
          <HeaderSmall>Server Location</HeaderSmall>
          <div style="display: flex; gap: 2px">
            <UISelect
              v-model="formData.selectedServer"
              :items="[`Custom IP`, ...serverLocations.map((a) => a.name)]"
              prefix="Server: "
            ></UISelect>
            <UIField v-model="formData.customServerIp" v-if="formData.selectedServer == `Custom IP`"></UIField>
          </div>
        </div>

        <div class="s">
          <HeaderSmall>Room Code</HeaderSmall>
          <UIField v-model="formData.roomCode"></UIField>
        </div>

        <div class="s">
          <HeaderSmall>Identification</HeaderSmall>
          <div style="display: flex; gap: 2px">
            <UIButtonLabel>Username</UIButtonLabel>
            <UIButtonLabel>Password</UIButtonLabel>
          </div>
          <div style="display: flex; gap: 2px">
            <UIField v-model="formData.username"></UIField>
            <UIField v-model="formData.password"></UIField>
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
}

.tabs-container {
  color: #6b7476;

  font-size: 10pt;
  display: flex;
}

.left {
  width: 40%;
  height: 100%;
  background: #54758142;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  border-right: 4px solid #04ca8f;
  border-top-right-radius: 25px;
  border-bottom-right-radius: 25px;

  position: relative;

  text-align: center;
  padding-left: 25px;
  padding-right: 25px;
}

.left::after {
  content: "";
  background: url(@/assets/images/tab_selected.png);
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;

  width: 20px;
  height: 20px;

  position: absolute;

  top: 50%;
  left: calc(100% + 4px);
  transform: translateX(-50%) translateY(-50%) rotate(-90deg) scale(1.5);
}

.right {
  width: 60%;
  height: 100%;

  padding: 40px;
}

.panel-1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;

  gap: 20px;
}

.panel-1 .s {
  border: 1px solid #04ca8f;
  padding: 10px;
  padding-left: 20px;
  border-radius: 10px;

  position: relative;

  width: 100%;
}

.panel-1 .s::before {
  content: attr(data-number);
  background: #04ca8f;
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 1000px;

  height: 30px;
  width: 30px;

  position: absolute;
  top: 50%;
  left: -15px;
  transform: translateY(-50%);
}

.panel-2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;

  gap: 20px;
}

.panel-2 .s {
  width: 100%;
}
</style>

<script setup lang="ts">
import { UILargeButton, UIDialogBox, UISelect, UIButtonLabel } from "vct-tools-components";
import HeaderBig from "./components/HeaderBig.vue";

import { ref, watch } from "vue";
import HeaderSmall from "./components/HeaderSmall.vue";
import UIField from "vct-tools-components/src/UIElement/UIField.vue";

const agreedToTerms = ref(false);
const requestConsentScreen = ref(false);

const serverLocations = ref([{ name: "AP Southeast (Sydney)", ip: "0.not.setup.yet.0.0.0" }]);

const formData = ref({
  customServerIp: "172.0.0.1",
  selectedServer: "Custom IP",
  roomCode: "",
  username: "",
  password: ""
});

const valid = ref({ v: false, m: "All fields are required" });

watch(
  formData,
  (n) => {
    (() => {
      if (n.selectedServer == "Custom IP" && n.customServerIp == "") {
        valid.value.v = false;
        valid.value.m = "All fields are required";
        return;
      }

      if (n.roomCode == "") {
        valid.value.v = false;
        valid.value.m = "All fields are required";
        return;
      }

      if (n.username == "") {
        valid.value.v = false;
        valid.value.m = "All fields are required";
        return;
      }

      if (n.password == "") {
        valid.value.v = false;
        valid.value.m = "All fields are required";
        return;
      }

      if (/\d\d\d-\d\d\d-\d\d\d/g.test(n.roomCode) == false) {
        valid.value.v = false;
        valid.value.m = "Invalid room code";
        return;
      }

      valid.value.v = true;
    })();
  },
  { deep: true }
);
</script>
