<template>
  <button @click="play1">播放音乐1</button>
</template>

<script>
export default {
  name: "DemoMusic",
  shouldListenPlayerChange: true,
  methods: {
    play1() {
      this.$player.switchMusic({
        loop: true,
        startTime: 30000,
        endTime: 40000,
        workId: "1",
        workPath:
          "https://qiniubanzou.sslmp3img.changba.com/mp3/user/7b8643103d7cc9489b536e60357804f0.mp3",
      });
    },
  },
};
</script>
