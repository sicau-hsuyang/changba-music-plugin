# 唱吧音乐播放器插件

此插件主要针对在唱吧内嵌中播放音乐的问题而开发，音乐播放器采用单例模式进行播放，可以有效提升性能。

此插件也封装了在唱吧内嵌 H5 页面播放音乐的时候，当页面关闭的时候，需要手动暂停音乐播放器的操作，为你想的更多。

# 使用方式

## 安装

```bash
npm i @changba/music-plugin -S
```

## 代码示例

```js
import { player } from "@chanba/music-plugin";
/**
 * 监听音乐上下文的改变，主要针对页面上有多个音乐需要播放的情况
 */
player.on("music-change", (info) => {
  console.log(info);
});

/**
 * 监听音乐播放器的状态改变，从而处理UI的变更
 */
player.on("state-change", (state) => {
  console.log(state);
});

/**
 * 切换音乐资源，加载音乐资源并播放音乐，对于同一个音乐资源（即ID和SOURCE相同），播放器自动处理为播放和暂停行为
 */
player.switchMusic({
  workId: "音乐资源的唯一性标识",
  workPath: "音乐资源的资源地址",
  // 可选，指定从某个时间开始播放，单位是MS，默认视为0
  startTime: 1000,
  // 可选，指定播放到某个位置就回到startTime，单位是MS
  endTime: 2000,
  // 可选，是否重复播放
  loop: true
});

/**
 * 播放音乐，主要针对播放器之前是暂停的状态，可以手动切换播放状态，
 */
player.playMusic();
/**
 * 暂停音乐，主要针对播放器之前是播放的状态，可以手动切换暂停状态，
 */
player.pauseMusic();

/**
 * 停止播放音乐，并且播放器加载的音乐资源切换为空
 */
player.initAudio();

/**
 * 停止播放音乐，并且将播放的音乐进度调整到0，不会清空播放器当前加载的音乐资源
 */
player.resetAudio();
```

## 与 Vue 集成

上述使用还是不太直接，需要开发者自己控制一些逻辑，因此插件提供了一个开箱即用的封装

首先注册插件

```js
import Vue from "vue";
import ChangaMusicPlugin from "@changba/music-plugin";

Vue.use(ChangaMusicPlugin);
```

在组件中使用

```vue
<!-- 插件中全局混入了一个cbMusicPlugin的对象，这个对象保存当前播放器的状态以及播放器的状态，你可以在你的组件内配置shouldListenPlayerChange选项，决定是否监听这个对象的变更 -->
<template>
  <CbModal @close="closeRcd">
    <div class="rcd">
      <div class="rcd-container">
        <div class="rcd-item" v-for="(row, rIdx) in songs" :key="rIdx">
          <div class="rcd-item__cover">
            <span
              class="rcd-item__cover-icon"
              :class="cbMusicPlugin.current.id === row.id && cbMusicPlugin.playState ? 'icon-pause' : 'icon-play'"
              @click="setCurrentAudio(row)"
            ></span>
            <img :src="row.icon" alt="" />
          </div>
          <div class="rcd-item__content">
            <p class="rcd-item__content-title">《{{ row.name }}》</p>
            <p class="rcd-item__content-desc">{{ row.artist }}</p>
          </div>
          <button class="rcd-item__btn" @click="playSong(row)"></button>
        </div>
      </div>
    </div>
  </CbModal>
</template>

<script>
export default {
  name: "RecommendDialog",
  // 注意，出于性能考虑只有这样组件才会被通知到变更
  shouldListenPlayerChange: true,
  props: {
    songs: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    setCurrentAudio(song) {
      this.$player.switchMusic({
        workId: song.id,
        workPath: song.originalMp3,
      });
    },
    closeRcd() {
      // 停止正在播放的音乐
      this.$player.initAudio();
    },
    playSong(song) {
      // 停止正在播放的音乐
      this.$player.initAudio();
    },
  },
};
</script>
```
