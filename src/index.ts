import { VueConstructor } from "vue";
import { player } from "./player";
export { player };

export default {
  install(Vue: VueConstructor) {
    Vue.prototype.$player = player;

    const MusicMixin = {
      data() {
        const __stateChangeCallback = (state: string) => {
          // @ts-ignore
          this.cbMusicPlugin.playState = state === "playing";
        };

        const __musicChangeCallback = (music: string) => {
          // @ts-ignore
          this.cbMusicPlugin.current = music;
        };
        return {
          callback: {
            __stateChangeCallback,
            __musicChangeCallback,
          },
          cbMusicPlugin: {
            playState: "stop",
            current: {},
          },
        };
      },
      mounted() {
        // @ts-ignore
        this.listenMusicChange();
      },
      beforeDestroy() {
        // @ts-ignore
        this.removeListenMusicChange();
      },
      methods: {
        removeListenMusicChange() {
          // @ts-ignore
          if (!this.$options.shouldListenPlayerChange) {
            return;
          }
          // @ts-ignore
          player.removeListener("state-change", this.callback.__stateChangeCallback);
          // @ts-ignore
          player.removeListener("music-change", this.callback.__musicChangeCallback);
        },
        listenMusicChange() {
          // 为了考虑性能，不需要对所有的组件都施加监听
          // @ts-ignore
          if (!this.$options.shouldListenPlayerChange) {
            return;
          }
          // @ts-ignore
          player.on("state-change", this.callback.__stateChangeCallback);
          // @ts-ignore
          player.on("music-change", this.callback.__musicChangeCallback);
        },
      },
    };

    Vue.mixin(MusicMixin);
  },
};
