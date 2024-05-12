import { VueConstructor } from "vue";
import { player } from "./player";
export { player };

export default {
  install(Vue: VueConstructor) {
    Vue.prototype.$player = player;
    const MusicMixin = {
      data() {
        return {
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
      methods: {
        listenMusicChange() {
          // 为了考虑性能，不需要对所有的组件都施加监听
          // @ts-ignore
          if (!this.$options.shouldListenPlayerChange) {
            return;
          }
          player.on("state-change", (state) => {
            // @ts-ignore
            this.cbMusicPlugin.playState = state === "playing";
          });
          player.on("music-change", (music) => {
            // @ts-ignore
            this.cbMusicPlugin.current = music;
          });
        },
      },
    };
    Vue.mixin(MusicMixin);
  },
};
