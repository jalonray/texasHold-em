<template>
    <div class="stage" @click="pop"></div>
</template>

<script>
    import * as PIXI from "pixi.js";
    // import anime from "animejs";
    import {Graphics} from "@pixi/graphics";

    export default {
        name: "TexasHold'em",
        data: function () {
            return {
                app: null,
                colors: ["75F4F4", "90E0F3", "B8B3E9", "D999B9"]
            };
        },
        mounted() {
            this.app = new PIXI.Application({
                transparent: true,
                antialias: true
            });
            this.$el.appendChild(this.app.view);
            this.app.renderer.view.style.display = "block";
            this.app.renderer.autoResize = true;
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
            // 0.8 window size table width
            let table_width = window.innerWidth * 0.8;
            // 1:2 table ratio
            let table_height = table_width * 0.5;
            let roundBox = new Graphics();
            roundBox.lineStyle(10, 0xC4870E, 1);
            roundBox.beginFill(0x457DA3);
            roundBox.drawRoundedRect(0, 0, table_width, table_height, table_height/2);
            roundBox.endFill();
            // make table placed center
            roundBox.x = table_width / 8;
            roundBox.y = (window.innerHeight - table_height) / 2 * 0.6;
            this.app.stage.addChild(roundBox);
        },
        methods: {
            pop() {

            }
        }
    }
</script>

<style scoped>

</style>