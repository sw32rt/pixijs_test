<style>
* {
    margin: 0;
    padding: 0;
}

.app {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.header {
    height: 48px;
    background-color: lightcyan;
    box-sizing: border-box;
    border: 8px solid blue;
}

.main {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
}

.sidebar {
    width: 300px;
    background-color: moccasin;
    box-sizing: border-box;
    border: 8px solid chocolate;
}

.content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.flex-content {
    flex-grow: 1;
    background-color: palegoldenrod;
    box-sizing: border-box;
    border: 8px solid green;
}

.fixed-content {
    height: 128px;
    background-color: thistle;
    box-sizing: border-box;
    border: 8px solid darkmagenta;
}

#divCanvasArea {
    flex-grow: 1;
    background-color: black;
    border: 0px;
}

#pixiCanvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
}

.cursorCanvas {
    position: relative;
    z-index: 2;
}

.chartCanvas {
    position: absolute;
    z-index: 3;
}

.chart_stage {
    border: 2px solid rgb(194, 146, 16);
}
</style>

<template>
    <v-app id="inspire">
        <div class="app">
            <div class="header">ヘッダー</div>
            <div class="main">
                <div class="sidebar">サイドバー
                    <!-- 左描画エリア -->
                    <div class="chart_stage">
                        <canvas id="chart1_mainLayer" class="chartCanvas"></canvas>
                        <canvas id="chart1_tipLayer" class="cursorCanvas"></canvas>
                    </div>
                    <div class="chart_stage">
                        <canvas id="chart2_mainLayer" class="chartCanvas"></canvas>
                        <canvas id="chart2_tipLayer" class="cursorCanvas"></canvas>
                    </div>
                    <div class="chart_stage">
                        <canvas id="chart3_mainLayer" class="chartCanvas"></canvas>
                        <canvas id="chart3_tipLayer" class="cursorCanvas"></canvas>
                    </div>
                    <v-btn @click="onclick">
                        Button
                    </v-btn>
                    <v-slider @update:model-value="onChange_R" @end="onSliderEnd_R" class="align-center" :max="200"
                        :min="20" hide-details>
                    </v-slider>
                    <v-slider @update:model-value="onChange_ddR" @end="onSliderEnd_ddR" class="align-center" :max="10"
                        :min="1" hide-details></v-slider>

                </div>

                <!-- 真ん中 -->
                <div class="content">
                    <!-- キャンバス描画エリア -->
                    <div id="divCanvasArea" class="flex-content">
                        <canvas id="pixiCanvas"></canvas>
                    </div>
                    <!-- 下描画エリア -->
                    <div class=" fixed-content">コンテンツ2</div>
                </div>
            </div>
        </div>
        <!-- <div class="divcontainer">
            <v-main style="height: 100%">
                <canvas id="pixiCanvas"></canvas>
            </v-main>
        </div>

        <v-navigation-drawer location="left">

        </v-navigation-drawer>

        <v-navigation-drawer location="right">
            <v-list>
                <v-list-item v-for="n in 5" :key="n" :title="`Item ${n}`" link></v-list-item>
            </v-list>
            <v-slider v-model="slider" class="align-center" :max="max" :min="min" hide-details>
                <template v-slot:append>
                    <v-text-field v-model="slider" hide-details single-line density="compact" type="number"
                        style="width: 70px"></v-text-field>
                </template>
            </v-slider>

        </v-navigation-drawer> -->



    </v-app>
</template>

<script lang="ts">
import { tSMethodSignature } from "@babel/types"
import { app_main, updateChart, app } from "./piximain.ts"

// import ResizableDivView from './components/ResizableDivView.vue';
export default {
    data() {
        return {
            tab: null,
            min: -50,
            max: 200,
            sl: 100,
            ddr: 0.01
            // app.global.path.endR,
        }
    },
    computed: {
        aaa: {
            get() {
                return this.sl
            },
            set(newValue: number) {
                // alert(newValue)

                this.sl = newValue
                app.global.path.endR = newValue
                app.global.path.drawPath()
                updateChart()
            }
        },
        ddr: {
            get() {
                return this.ddr * 1000000
            },
            set(newValue: number) {
                // alert(newValue)
                newValue *= 0.000001
                console.log(newValue)
                this.ddr = newValue
                app.global.path.ddr = newValue
                app.global.path.drawPath()
                updateChart()
            }
        }
    },
    methods: {
        onclick() {
            // app.global.path.endR = 50
            app.global.path.drawPath()
        },
        onChange_R(value) {
            app.global.path.endR = value
            app.global.path.drawPath()
        },
        onSliderEnd_R() {
            updateChart()

        },
        onChange_ddR(value) {
            app.global.path.ddr = value * 0.0000001
            app.global.path.drawPath()
        },
        onSliderEnd_ddR() {
            updateChart()

        },

    },
    mounted() {
        app_main()
    },

    // components: {
    //     ResizableDivView
    // },




}


</script>
