<template>
  <div class="filters">
    <div class="filters_title">Chat Filters</div>
    <van-form @submit="onSubmit">
      <div class="filters_label">Show me with shake</div>
      <div class="filters_container gender">
        <img class="filters_container_icon" src="../assets/img/ic_gender.png" />
        <div class="filters_container_slide" />
        <van-radio-group v-model="gender" direction="horizontal">
          <van-radio
            v-for="(value, key) of GENDER_FILTER_LIST"
            :name=key :key="key" @click="preCheck"
            :class="gender === key ? 'checked': ''"
          >
            {{ value }}
            <template #icon="props">
              <img
                v-if="!props.checked"
                class="img-icon" src="../assets/img/ic_lock_l.png" />
            </template>
          </van-radio>
        </van-radio-group>
      </div>
      <div class="filters_label">Select pair age</div>
      <div class="filters_container age_range">
        <img class="filters_container_icon" src="../assets/img/ic_age.png" />
        <div class="filters_container_slide" />
        <van-radio-group v-model="ageRange" direction="horizontal">
          <van-radio
            v-for="(value, key) of AGE_FILTER_LIST"
            :name=key :key="key" @click="preCheck"
            :class="ageRange === key ? 'checked': ''"
          >
            {{ value }}
          </van-radio>

        </van-radio-group>
      </div>
      <div class="filters_label">Pair by location</div>
      <div class="filters_container locate">
        <van-radio-group v-model="locate" direction="horizontal">
          <van-radio
            v-for="(value, key) of LOCATE_FILTER_LIST"
            :name=key
            :key="key"
            :class="locate === key ? 'checked': ''"
            @click="onLocateClick"
          >
            {{ value }}
          </van-radio>
        </van-radio-group>
      </div>
      <div class="btns">
        <van-button class="cancel" round block type="info" @click="onCancel">Cancel</van-button>
        <van-button class="ok" round block type="info" native-type="submit">OK</van-button>
      </div>
    </van-form>
    <van-action-sheet
      v-model="show" title="Unlock filters" :closeable="false"
      description="Fill in your info to get precise pair result. Once submitted,
      it can‘t be modified."
      class=""
    >
      <div v-if="step === 1" class="content">
        <div class="content_center">
          <div class="content_title">Select your gender</div>

          <div class="filters_container gender">
            <img class="filters_container_icon" src="../assets/img/ic_gender.png" />
            <div class="filters_container_slide" />
            <van-radio-group v-model="infoChosen.gender" direction="horizontal">
              <van-radio
                v-for="(value, key) of GENDER_FILTER_LIST"
                :name=key :key="key"
                :class="infoChosen.gender === key ? 'checked': ''"
              >
                {{ value }}
              </van-radio>
            </van-radio-group>
          </div>
        </div>
        <van-button
          :disabled="!infoChosen.gender" round block type="info" @click="saveGender"
        >Next</van-button>
      </div>
      <div v-if="step === 2" class="content">
        <div class="content_center">
          <div class="content_title">Select your age</div>
          <van-picker
            title="标题"
            :show-toolbar="false"
            :columns="AGE_CHOOSE_LIST"
            default-index="17"
            item-height="28"
            ref="agePicker"
          />
        </div>
        <van-button round block type="info" @click="saveAge">Next</van-button>
      </div>
      <div v-if="step === 3" class="content">
        <div class="content_center">
          <img class="locate_img" src="../assets/img/ic_h5_graphic_location_permission.png" />
          <div class="locate_desc">
            <div class="text">
              Access your location permission to check your nearby story
            </div>
            <img
              class="locate_switch"
              @click="changeInfoLocate"
              :src="infoChosen.locate ? require('../assets/img/ic_settings_switch_on.png') :
               require('../assets/img/ic_settings_switch_off.png')">
          </div>
        </div>
        <van-button round block type="info" @click="saveInfo">DONE</van-button>
      </div>
    </van-action-sheet>
  </div>
</template>
<script>
import {
  Form, Field, Button, Switch, RadioGroup, Radio, ActionSheet, Picker, Toast,
} from 'vant';
import axios from 'axios';
import Conf from '../common/config';

const GENDER_FILTER_LIST = {
  1: 'Male',
  2: 'Female',
  3: 'Unisex',
};

const AGE_FILTER_LIST = {
  1: '<14',
  2: '14-22',
  3: '22+',
  4: 'All',
};
const LOCATE_FILTER_LIST = {
  1: 'Yes',
  2: 'Nope',
};

const SEX_CHOOSE_LIST = {
  1: 'GIRL',
  2: 'GUY',
  3: 'ALL',
};

export default {
  components: {
    [Form.name]: Form,
    [Field.name]: Field,
    [Button.name]: Button,
    [Switch.name]: Switch,
    [RadioGroup.name]: RadioGroup,
    [Radio.name]: Radio,
    [ActionSheet.name]: ActionSheet,
    [Picker.name]: Picker,
    [Toast.name]: Toast,
  },
  data() {
    return {
      GENDER_FILTER_LIST,
      AGE_FILTER_LIST,
      LOCATE_FILTER_LIST,
      SEX_CHOOSE_LIST,
      AGE_CHOOSE_LIST: [],
      gender: '3', // default all
      ageRange: '4',
      locate: '2',
      position: {},
      info: null,
      step: 1,
      show: false,
      infoChosen: {
        gender: '',
        age: '',
        locate: false,
        latitude: '',
        longitude: '',
      },
      configData: {
        enableShakeShake: false,
        shakeResultDelay: 5000,
        hasLocation: false,
        lastProfileUpdateTime: 0,
      },
      saveLocationInfo: false,
      locationFail: false, // 定位错误后 可以增加提示。
    };
  },
  computed: {
    mobile() {
      const { mobile } = this.$route.query;
      return mobile ? String(mobile).replace(/^ /, '+') : '';
    },
  },
  async mounted() {
    this.AGE_CHOOSE_LIST = this.initAgeChooseList();
    await this.getConfig();
    this.initFilterSetting();
  },
  methods: {
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
    initAgeChooseList() {
      let i = 1;
      const res = [];
      while (i <= 35) {
        if (i === 35) {
          res.push(`${i}+`);
        } else {
          res.push(`${i}`);
        }
        i += 1;
      }
      return res;
    },
    initFilterSetting() {
      const config = sessionStorage.getItem('filterSetting');
      if (!config) return;
      const { gender, ageRange, locate } = JSON.parse(config);
      this.gender = gender;
      this.ageRange = ageRange;
      this.locate = locate;
    },
    onSubmit() {
      if (this.preCheck()) {
        const { gender, ageRange, locate } = this;
        window.sessionStorage.setItem('filterSetting', JSON.stringify({
          gender,
          ageRange,
          locate,
        }));
        this.$router.go(-1);
      }
    },
    onCancel() {
      this.$router.push(`/?mobile=${this.mobile}`);
    },
    preCheck() {
      // 未更新过userInfo
      if (this.configData.lastProfileUpdateTime === 0) {
        this.show = true;
        return false;
      }
      return true;
    },
    async onLocateClick() {
      if (!this.preCheck()) {
        this.show = true;
      } else {
        if (!navigator.geolocation) {
          console.log('Geolocation is not supported by your browser');
          return;
        }
        if (+this.locate === 1) { // Yes
          // if info.location exsit, do nothing
          if (this.configData.hasLocation || this.saveLocationInfo) return;
          // get geolocation
          const result = await this.getGeoLocation();
          if (result.status) {
            this.position = {
              latitude: result.data.latitude,
              longitude: result.data.longitude,
            };
            this.updateLocationInfo(this.position);
          } else {
            this.locationFail = true;
            Toast(result.message);
            setTimeout(() => {
              this.locate = '2';
            }, 1000);
          }
        }
      }
    },
    async updateLocationInfo(position) {
      this.saveLocationInfo = true;
      const params = {
        user_info: {
          mobile: this.mobile,
          longitude: Number(position.longitude),
          latitude: Number(position.latitude),
        },
      };
      const { data, status } = await axios.post(`${Conf.BASE_URL}/shake.gateway.ShakeGatewayService/UploadCoordinate`, params);
      if (status === 200 && data.message === 'success') {
        await this.getConfig();
      }
      this.saveLocationInfo = false;
    },
    async getGeoLocation() {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition((position) => {
          resolve({
            status: true,
            data: position.coords.longitude,
          });
        }, (e) => {
          resolve({
            status: false,
            message: e.message,
            data: {},
          });
        });
      });
    },
    saveGender() {
      this.step += 1;
    },
    saveAge() {
      const age = this.$refs.agePicker.getValues()[0];
      this.infoChosen.age = age;
      this.step += 1;
    },
    async changeInfoLocate() {
      if (!this.infoChosen.locate) {
        // get geolocation
        const result = await this.getGeoLocation();
        if (result.status) {
          // 定位成功后开启switch;
          this.infoChosen.locate = !this.infoChosen.locate;
          this.position = {
            latitude: result.data.latitude,
            longitude: result.data.longitude,
          };
          this.updateLocationInfo(this.position);
        } else {
          this.locationFail = true;
          Toast(result.message);
        }
      }
    },
    async saveInfo() {
      const [locale, countryCode] = navigator.language.split('-');
      const {
        gender, age, ...info
      } = this.infoChosen;
      const params = {
        user_info: {
          mobile: this.mobile,
          locale,
          country_code: countryCode || locale,
          gender: Number(gender),
          age: Number(age) || 36,
        },
      };
      if (info.latitude && info.longitude) {
        params.user_info.latitude = Number(info.latitude);
        params.user_info.longitude = Number(info.longitude);
      }
      // TODO delete
      this.show = false;
      const { data, status } = await axios.post(`${Conf.BASE_URL}/shake.gateway.ShakeGatewayService/UploadProfile`, params);
      if (status === 200 && data.message === 'success') {
        // 更新config;
        await this.getConfig();
      }
      this.show = false;
    },
  },
};
</script>
<style>
.filters {
  padding-top: 59px;
}
.filters_title {
  font-family: Roboto-Bold;
  font-size: 22px;
  color: #000000;
  letter-spacing: 0;
  font-weight: 700;
  padding-left: 35px;
  margin-bottom: 38px;
}
.filters_label {
  opacity: 0.84;
  font-family: NotoSansCJKtc-Medium;
  font-size: 12px;
  color: #000000;
  letter-spacing: 0;
  line-height: 14px;
  font-weight: 500;
  margin: 0 0 2px 35px;
}
.filters_container{
  display: flex;
  align-items: center;
  height: 44px;
  margin: 0 32px 0 33px;
  margin-bottom: 20px;
  opacity: 0.95;
  border: 1px solid #D0D0CD;
  border-radius: 22px;
}
.filters_container.gender {
  padding: 0 11px 0 18px;
}
.filters_container.gender .img-icon {
  width: 14px;
  height: 14px;
}
.filters_container .van-radio-group {
  display: flex;
  width: 100%;
  align-items: center;
}
.filters_container .van-radio {
  display: flex;
  justify-content: center;
  flex: 1;
  margin: 0;
  font-family: Roboto-Regular;
  font-size: 12px;
  color: #C0C0C0;
  text-align: center;
  font-weight: 400;
  height: 28px;
  opacity: 0.95;
  border: 1px solid #D0D0CD;
  border-radius: 32.43px;
}
.filters_container .van-radio.checked {
  opacity: 0.95;
  background-image: linear-gradient(90deg, #3F6CF3 0%, #A862A8 52%, #FF5969 100%);
  border-radius: 32.43px;
  /* border-image: linear-gradient(90deg, #3F6CF3 0%, #A862A8 52%, #FF5969 100%) 1px 1px; */
}
.filters_container .van-radio.checked .van-radio__label {
  font-family: Roboto-Bold;
  font-size: 11px;
  color: #FFFFFF;
  text-align: center;
  font-weight: 700;
}
.filters_container.gender .van-radio.checked .van-radio__icon{
  display: none;
}
.filters_container.gender .van-radio:not(:last-child){
  margin-right: 4px;
}
.filters_container.gender .van-radio__label {
  margin-left: 1px;
}

.filters_container.age_range {
  padding: 0 15px 0 18px;
}
.filters_container.age_range .van-radio .van-radio__icon{
  display: none;
}
.filters_container.age_range .van-radio:not(:last-child){
  margin-right: 10.67px;
}
.filters_container.age_range .van-radio__label {
  margin-left: 0;
}

.filters_container.locate {
  padding: 0 13px;
}

.filters_container.locate .van-radio:first-child{
  margin-right: 9px;
}

.filters_container.locate .van-radio .van-radio__icon{
  display: none;
}

.filters_container_icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}
.filters_container_slide {
  width: 1.95px;
  height: 23.45px;
  margin-right: 8.05px;
  background: #CCCCCC;
}
.filters .btns {
  position: fixed;
  left: 0;
  bottom: 46px;
  display: flex;
  padding: 0 29px;
  font-family: Roboto-Medium;
  font-size: 15px;
  font-weight: 500;
  text-align: center;
  width: 100%;
  box-sizing: border-box;

}
.filters .btns .van-button{
  flex: 1;
}

.filters .btns .cancel {
  border: 2px solid #3964E5;
  color: #3964E5;
  background-color: #FFFFFF;
  margin-right: 14px;
}
.filters .btns .ok {
  box-shadow: 0 -4px 6px 0 rgba(0,0,0,0.10);
  background: #3964E5;
  border-radius: 22px;
  color: #FFFFFF;
}

/* action-modal */
.filters .van-action-sheet__header {
  padding-top: 30px;
  line-height: unset;
  font-family: Roboto-Medium;
  font-size: 18px;
  color: #000000;
  text-align: center;
  font-weight: 500;
}
.filters .van-action-sheet__description {
  font-family: Roboto-Regular;
  font-size: 11px;
  color: #9D9D9D;
  letter-spacing: 0;
  text-align: center;
  font-weight: 400;
  line-height: unset;
  padding: 0;
  margin-top: 4px;
}
.filters .van-action-sheet__description::after {
  width: 0;
}
.filters .van-action-sheet__content .content_center {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  height: 228px;
}
.filters .van-action-sheet__content .content_title{
  opacity: 0.84;
  font-family: Roboto-Bold;
  font-size: 14px;
  color: #000000;
  letter-spacing: 0;
  text-align: center;
  line-height: 14px;
  font-weight: 700;
  margin-bottom: 8px;
}

.filters .van-action-sheet__content .filters_container .van-radio .van-radio__icon{
  display: none;
}

.filters .van-action-sheet__content .filters_container {
  padding: 0 15px 0 24px;
  width: calc(100% - 64px);
  margin: 0;
  box-sizing: border-box;
}

.filters .van-action-sheet__content .van-button {
  margin: 0 31px 46px 34px;
  width: calc(100% - 65px);
  background: #3964E5;
  border-radius: 22px;
}
.filters .van-action-sheet__content .van-button--disabled {
  border: 2px solid #D3D3D0;
  border-radius: 22px;
  font-family: Roboto-Medium;
  font-size: 15px;
  color: #C2C2C2;
  text-align: center;
  font-weight: 500;
  background: #fff;
}

.filters .van-action-sheet__content .van-picker-column__item {
  height: 28px;
  font-family: PingFangTC-Medium;
  font-size: 13px;
  text-align: center;
  line-height: 28px;
  font-weight: 500;
}

.filters .van-action-sheet__content .van-picker-column__item--selected {
  color: #FFFFFF;
  background-image: linear-gradient(90deg, #3F6CF3 0%, #A862A8 52%, #FF5969 100%);
  border-radius: 32.43px;
}

.filters .van-action-sheet__content .locate_img {
  width: 110px;
  height: 89px;
}

.filters .van-action-sheet__content .locate_desc {
  margin-top: 11px;
  padding: 0 37px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.filters .van-action-sheet__content .locate_desc .text {
  font-family: Roboto-Regular;
  font-size: 12px;
  color: #434343;
  letter-spacing: 0;
  font-weight: 400;
  margin-right: 57px;
}

.filters .van-action-sheet__content .locate_switch {
  width: 40px;
  height: 24px;
  cursor: pointer;
}

</style>
