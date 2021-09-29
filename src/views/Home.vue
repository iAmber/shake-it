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
          {{ $t('title') }}
        </div>
        <div class="sub-title">
          {{ $t('desc') }}
        </div>
      </div>
      <div>
        <router-link :to="`/filters?mobile=${mobile}`">
          <van-button round block type="info" native-type="submit" class="button-ext">
            {{ $t('tap') }}
          </van-button>
        </router-link>
      </div>
    </div>
    <div class="shaking-page" v-show="shakeState === STATE.SEARCHING">
      <div class="shaking-title">
        {{ $t('soulmate') }}
      </div>
      <div class="animation-content" >
        <div ref="animationel" class="animation-content-inner">
          <img src="../assets/img/ic_h5_graphic_search.png" width="127" height="124">
        </div>
      </div>
      <div class="shaking-text">
        {{ $t('Searching') }}
      </div>
    </div>
    <div class="shaking-result-empty" v-show="shakeState === STATE.EMPTY">
      <div class="empty-title">
        {{ $t('again') }}
      </div>
      <div class="empty-image">
        <img src="../assets/img/ic_h5_graphic_no_noti.png" width="160" height="175">
      </div>
      <div class="empty-text">
        {{ $t('Unfind') }}
      </div>
      <van-button
        round
        block
        type="info"
        class="button-ext"
        @click="shakeState = STATE.INIT"
      >
        {{ $t('Refresh') }}
      </van-button>
    </div>
  </div>
</template>

<script>
import Shake from 'shake.js';
import lottie from 'lottie-web';
import {
  Button, Toast,
} from 'vant';
import axios from 'axios';
import anidata from '../assets/shaking';
import Conf from '../common/config';

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
      configData: {
        enableShakeShake: false,
        shakeResultDelay: 5000,
        hasLocation: false,
        lastProfileUpdateTime: 0,
      },
      ageRangeMap: {
        1: [0, 14],
        2: [15, 22],
        3: [23, 100],
        4: [0, 100],
      },
    };
  },
  components: {
    [Button.name]: Button,
  },
  computed: {
    mobile() {
      const { mobile } = this.$route.query;
      return mobile ? String(mobile).replace(/^ /, '+') : '';
    },
  },
  async mounted() {
    const myShakeEvent = new Shake({
      threshold: 12, // optional shake strength threshold
      timeout: 500, // optional, determines the frequency of event generation
    });
    myShakeEvent.start();
    myShakeEvent.hasDeviceMotion = true;
    window.addEventListener('shake', async () => {
      await this.shakeEventDidOccur();
    }, false);

    this.lottie = lottie.loadAnimation({
      container: this.$refs.animationel,
      renderer: 'svg',
      loop: true,
      animationData: anidata,
    });
    await this.getConfig();
  },
  methods: {
    transferAgeToRange(value) {
      const data = this.ageRangeMap[value] || this.ageRangeMap['4'];
      return { startAge: data[0], endAge: data[1] };
    },
    async getConfig() {
      const params = {
        mobile: this.mobile,
        androidId: '',
        appCode: 'h5',
        version: '',
      };
      const { data, status } = await axios.post(`${Conf.BASE_URL}/shake.gateway.ShakeGatewayService/GetConfig`, params);
      if (status === 200) {
        this.configData = { ...data };
      }
    },
    getFilters() {
      const config = sessionStorage.getItem('filterSetting');
      let result = {
        gender: 3,
        ageRange: 4,
        locate: 2,
      };
      if (!config) {
        try {
          const parseData = JSON.parse(config);
          result = { ...parseData };
        } catch (e) {
          console.log(e);
        }
      }
      return result;
    },
    async shakeit() {
      const { gender, ageRange, locate } = this.getFilters();
      const { startAge, endAge } = this.transferAgeToRange(ageRange);
      const params = {
        mobile: this.mobile,
        app_code: 'fm',
        filter_info: {
          gender,
          start_age: startAge,
          end_age: endAge,
          enable_location: locate === 1,
        },
      };
      const { data, status } = await axios.post(`${Conf.BASE_URL}/shake.gateway.ShakeServiceV2/StartMatch`, params);
      if (status === 200 && data.message === 'ok') {
        return true;
      }
      return false;
    },
    async shakeEventDidOccur() {
      const { STATE } = this;
      if (this.shakeState !== STATE.SEARCHING) {
        this.shakeState = STATE.SEARCHING;
        // 播放音频
        const audio = this.$refs.shakeAudio;
        audio.play();
        // 播放动画
        this.lottie.play();
        // 请求接口
        let result = false;
        try {
          result = await this.shakeit();
        } catch (e) {
          console.log(e);
          result = false;
        }
        if (result) {
          setTimeout(async () => {
            const mobile = await this.checkResult();
            if (mobile) {
              // 播放音效和震动， 500ms之后唤起native;
              this.hasResult();
              setTimeout(() => {
                this.callNative(mobile);
                this.lottie.pause();
                this.shakeState = STATE.INIT;
              }, 500);
            } else {
              this.lottie.pause();
              this.shakeState = STATE.EMPTY;
            }
          }, this.configData.shakeResultDelay || 5000);
        } else {
          this.lottie.pause();
          this.shakeState = STATE.INIT;
          Toast('Error, try again!');
        }
      }
    },
    async checkResult() {
      const params = {
        mobile: this.mobile,
      };
      const { data, status } = await axios.post(`${Conf.BASE_URL}/shake.gateway.ShakeServiceV2/CheckMatchResult`, params);
      if (status === 200 && data.mobile) {
        return data.mobile;
      }
      return false;
    },
    callNative(mobile) {
      if (window.JsProxy) {
        window.JsProxy.postEvent('go_to_talk', escape(mobile));
      } else {
        Toast(`success info: ${mobile}`);
      }
    },
    hasResult() {
      const audio = this.$refs.shakeResult;
      audio.play();
      if (window.navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
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
