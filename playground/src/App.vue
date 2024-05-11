<template>
  <div id="app">
    {{ detail }}
    <hr />
    <button @click="play1">播放音乐1</button>
    <button @click="play2">播放音乐2</button>
    <button @click="init">初始化音乐播放器</button>
  </div>
</template>

<script>
import { player } from "../../dist";
player.on("state-change", (state) => {
  console.log(state);
});

export default {
  name: "App",
  data() {
    return {
      detail: null,
    };
  },
  mounted() {
    player.on("music-change", (info) => {
      console.log(info);
      this.detail = info;
    });
  },
  methods: {
    play1() {
      player.switchMusic({
        loop: true,
        startTime: 30000,
        endTime: 40000,
        workId: "1",
        workPath: "https://qiniubanzou.sslmp3img.changba.com/mp3/user/7b8643103d7cc9489b536e60357804f0.mp3",
      });
    },
    play2() {
      player.switchMusic({
        workId: "2",
        workPath: "https://qiniubanzou.sslmp3img.changba.com/mp3/user/60c5eb0330401d7ded24f22dea9195eb.mp3",
      });
    },
    init() {
      player.initAudio();
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
