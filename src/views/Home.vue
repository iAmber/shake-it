<template>
  <div class="home">
    <div style="height:1px; width:1px; overflow:hidden">
      <audio src="../assets/mp3/5018.mp3" ref="shakeAudio"></audio>
      <audio src="../assets/mp3/5012.mp3" ref="shakeResult"></audio>
    </div>
    <div class="animation">
      摇一摇:{{shaked}}<br/>
      震动: {{vibrate}}<br/>
    </div>
    <div>
      <router-link to="/filters">Filters</router-link>
    </div>
  </div>
</template>

<script>
import Shake from 'shake.js';

export default {
  name: 'Home',
  data() {
    return {
      shaked: 'false',
      vibrate: 'unknown',
    };
  },
  components: {
  },
  mounted() {
    const myShakeEvent = new Shake({
      threshold: 12, // optional shake strength threshold
      timeout: 500, // optional, determines the frequency of event generation
    });
    myShakeEvent.start();
    myShakeEvent.hasDeviceMotion = true;
    window.addEventListener('shake', this.shakeEventDidOccur, false);
  },
  methods: {
    shakeEventDidOccur() {
      const audio = this.$refs.shakeAudio;
      this.shaked = 'shake audio';
      if (window.navigator.vibrate) {
        navigator.vibrate([500, 200, 500]);
        this.vibrate = 'support';
      } else {
        this.vibrate = 'not support';
      }
      audio.play();
      setTimeout(this.shakeResult, 1000);
    },

    shakeResult() {
      this.shaked = 'shaked result';
      const audio = this.$refs.shakeResult;
      audio.play();
    },
  },
};
</script>
