<template>
  <div class="home">
    <div class="shake-page" v-show="[STATE.INIT, STATE.SUCCESS].indexOf(shakeState) !== -1">
      <div style="height:1px;width:1px;overflow:hidden;">
        <audio controls src="../assets/mp3/5018.mp3" ref="shakeAudio"></audio>
        <audio controls src="../assets/mp3/5012.mp3" ref="shakeResult"></audio>
      </div>
      <div class="main-content">
        <div class="base-image">
          <img src="../assets/img/ic_graphic_shake_phone.png" width="229" height="211">
        </div>
        <div class="title">
          Shake it now!
        </div>
        <div class="sub-title">
          What a coincidence! Shake phone to pair with who shaked phone at the same time!
        </div>
      </div>
      <div>
        <router-link to="/filters">
          <van-button round block type="info" native-type="submit" class="button-ext">
            Set Filter
          </van-button>
        </router-link>
      </div>
    </div>
    <div class="shaking-page" v-show="shakeState === STATE.SEARCHING">
      <div class="shaking-title">
        Looking for soulmate…
      </div>
      <div class="animation-content" >
        <div ref="animationel" class="animation-content-inner">
          <img src="../assets/img/ic_h5_graphic_search.png" width="127" height="124">
        </div>
      </div>
      <div class="shaking-text">
        Searching…
      </div>
    </div>
    <div class="shaking-result-empty" v-show="shakeState === STATE.EMPTY">
      <div class="empty-title">
        Hmmm…seems no suitable soulmate, try again?
      </div>
      <div class="empty-image">
        <img src="../assets/img/ic_h5_graphic_no_noti.png" width="160" height="175">
      </div>
      <div class="empty-text">
        Not finding any suitable soulmate, maybe come refreshing later
      </div>
      <van-button
        round
        block
        type="info"
        class="button-ext"
        @click="shakeState = STATE.INIT"
      >
        Refresh
      </van-button>
    </div>
  </div>
</template>

<script>
import Shake from 'shake.js';
import lottie from 'lottie-web';
import {
  Button,
} from 'vant';
import anidata from '../assets/shaking';
// import Conf from '../common/config';

export default {
  name: 'Home',
  data() {
    return {
      shakeState: 0,
      STATE: {
        INIT: 0,
        SEARCHING: 1,
        EMPTY: 2,
        SUCCESS: 3,
      },
    };
  },
  components: {
    [Button.name]: Button,
  },
  async mounted() {
    const myShakeEvent = new Shake({
      threshold: 12, // optional shake strength threshold
      timeout: 500, // optional, determines the frequency of event generation
    });
    myShakeEvent.start();
    myShakeEvent.hasDeviceMotion = true;
    window.addEventListener('shake', () => {
      this.shakeEventDidOccur();
    }, false);

    this.lottie = lottie.loadAnimation({
      container: this.$refs.animationel,
      renderer: 'svg',
      loop: true,
      animationData: anidata,
    });
  },
  methods: {
    shakeEventDidOccur() {
      const { STATE } = this;
      if (this.shakeState !== STATE.SEARCHING) {
        this.shakeState = STATE.SEARCHING;
        const audio = this.$refs.shakeAudio;
        if (window.navigator.vibrate) {
          navigator.vibrate([500, 200, 500]);
        }
        audio.play();
        this.lottie.play();
      }
      setTimeout(() => {
        this.shakeResult();
        this.lottie.pause();
      }, 5000);
    },

    shakeResult() {
      // const result = Math.floor(Math.random() * 2);
      const { STATE } = this;
      // if (result > 0) {
      // this.shakeState = STATE.SUCCESS;
      // } else {
      this.shakeState = STATE.EMPTY;
      // }
      // if (this.shakeState === STATE.SUCCESS) {
      const audio = this.$refs.shakeResult;
      audio.play();
      // }
    },
  },
};
</script>
<style>
.home{
  width:80%;
  margin: auto;
  text-align: center;
}
.base-image{
  margin-top: 105px;
  margin-top: 13vh;
  margin-bottom: 18px;
}
.title{
  font-size: 18px;
  margin: 18px 0 10px;
}
.sub-title{
  font-size: 14px;
  color:#434343;
}
.button-ext{
  font-size: 15px;
  font-weight: 800;
}
.main-content{
  margin-bottom: 106px;
  margin-bottom: 20vh;
}

.shaking-title{
  text-align: left;
  font-size: 22px;
  font-weight: bold;
  margin: 60px 0 72px;
}
.animation-content{
  text-align:center;
}
.animation-content-inner{
  width:260px;
  height:250px;
  margin: 0 auto;
  position:relative;
}
.animation-content img{
  position:absolute;
  top:86px;
  left:90px;
  z-index: 1;
}
.shaking-text{
  margin-top: 42px;
  font-size: 15px;
  font-weight: 800;
}
.empty-title{
  margin: 60px 0 87px;
  text-align: left;
  font-size: 22px;
  font-weight: bold;
}
.empty-text{
  color: #434343;
  font-size: 14px;
  margin: 22px 0 123px;
}
</style>
