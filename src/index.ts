import { VueConstructor } from "vue";
import { player } from "./player";
export { player };

export default {
  install(Vue: VueConstructor) {
    Vue.prototype.$player = player;
    const MusicMixin = {
      data() {
        return {
          playState: "stop",
          ctxMusic: {},
        };
      },
      mounted() {
        player.on("state-change", (state) => {
          // @ts-ignore
          this.playState = state === "playing";
        });
        player.on("music-change", (music) => {
          // @ts-ignore
          this.ctxMusic = music;
        });
      },
    };
    Vue.mixin(MusicMixin);
  },
};
