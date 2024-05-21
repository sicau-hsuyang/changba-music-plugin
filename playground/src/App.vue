<template>
  <div id="app">
    {{ cbMusicPlugin }}
    <hr />
    <button @click="play1">播放音乐1</button>
    <button @click="play2">播放音乐2</button>
    <button @click="play3">播放音乐3</button>
    <button @click="init">初始化音乐播放器</button>
  </div>
</template>

<script>
export default {
  name: "App",
  shouldListenPlayerChange: true,
  data() {
    return {};
  },
  methods: {
    play1() {
      this.$player.switchMusic({
        loop: true,
        startTime: 30000,
        endTime: 40000,
        workId: "1",
        workPath: "https://qiniubanzou.sslmp3img.changba.com/mp3/user/7b8643103d7cc9489b536e60357804f0.mp3",
      });
    },
    play2() {
      this.$player.switchMusic({
        workId: "2",
        workPath: "https://qiniubanzou.sslmp3img.changba.com/mp3/user/60c5eb0330401d7ded24f22dea9195eb.mp3",
      });
    },
    play3() {
      this.$player.switchMusic({
        loop: true,
        workId: "3",
        workPath: "https://qiniubanzou.sslmp3img.changba.com/mp3/user/7b8643103d7cc9489b536e60357804f0.mp3",
      });
    },
    init() {
      this.$player.initAudio();
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
