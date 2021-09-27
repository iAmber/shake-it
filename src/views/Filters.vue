<template>
  <div class="filters">
    <div>Chat Filters</div>
    <van-form @submit="onSubmit">
      <van-radio-group v-model="sex" direction="horizontal">
        <van-radio
          v-for="(value, key) of SEX_FILTER_LIST" :name=key :key="key" @click="preCheck"
        >
          {{ value }}
        </van-radio>
      </van-radio-group>
      <van-radio-group v-model="ageRange" direction="horizontal">
        <van-radio
          v-for="(value, key) of AGE_FILTER_LIST" :name=key :key="key" @click="preCheck"
        >
          {{ value }}
        </van-radio>
      </van-radio-group>
      <van-switch v-model="switchChecked" size="24px" />
      <div style="margin: 16px;">
        <van-button round block type="info" native-type="submit">Cancel</van-button>
        <van-button round block type="info" native-type="submit">Confirm</van-button>
      </div>
    </van-form>
    <van-action-sheet
      v-model="show" title="标题" :closeable="false"
    >
      <div v-if="step === 1" class="content">
        选择你的性别
        <van-radio-group v-model="infoChosen.sex" direction="horizontal">
          <van-radio
            v-for="(value, key) of SEX_CHOOSE_LIST" :name=key :key="key"
          >
            {{ value }}
          </van-radio>
        </van-radio-group>
        <van-button round block type="info" @click="saveSex">Next</van-button>
      </div>
      <div v-if="step === 2" class="content">
        选择你的年龄
        <van-picker
          title="标题"
          :show-toolbar="false"
          :columns="AGE_CHOOSE_LIST"
          ref="agePicker"
        />
        <van-button round block type="info" @click="saveAge">Next</van-button>
      </div>
      <div v-if="step === 3" class="content">
        <van-button round block type="info" @click="saveInfo">Save</van-button>
      </div>
    </van-action-sheet>
  </div>
</template>
<script>
import {
  Form, Field, Button, Switch, RadioGroup, Radio, ActionSheet, Picker,
} from 'vant';

const SEX_FILTER_LIST = {
  1: 'GIRL',
  2: 'GUY',
  3: 'ALL',
};

const AGE_FILTER_LIST = {
  1: 'GIRL',
  2: 'GUY',
  3: 'ALL',
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
  },
  data() {
    return {
      SEX_FILTER_LIST,
      AGE_FILTER_LIST,
      SEX_CHOOSE_LIST,
      AGE_CHOOSE_LIST: [],
      sex: '',
      ageRange: '',
      switchChecked: false,
      info: null,
      step: 1,
      show: false,
      infoChosen: {
        sex: '',
        age: '',
        isLocate: false,
      },
    };
  },
  mounted() {
    this.AGE_CHOOSE_LIST = this.initAgeChooseList();
  },
  methods: {
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
    onSubmit(values) {
      console.log('submit', values);
    },
    preCheck() {
      if (!this.info) {
        console.log('empty info');
        this.show = true;
      }
    },
    saveSex() {
      this.step += 1;
    },
    saveAge() {
      const age = this.$refs.agePicker.getValues()[0];
      console.log('age', age);
      this.infoChosen.age = age;
      this.step += 1;
    },
    saveInfo() {
      this.infoChosen.location = '';
      // TODO save and update info
    },
  },
};
</script>
