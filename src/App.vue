<style>
.divcontainer::after {
    content: '';
    display: block;
    clear: both;
}
</style>

<template>
    <v-app id="inspire">
        <v-system-bar>
            <v-spacer></v-spacer>

            <v-icon>mdi-square</v-icon>

            <v-icon>mdi-circle</v-icon>

            <v-icon>mdi-triangle</v-icon>
        </v-system-bar>
        <v-layout style="height: 128px;" class="border rounded">
            <div class="mx-auto my-4">
                <v-btn color="deep-purple" variant="outlined" @click="active = !active">
                    Toggle Navigation
                </v-btn>
            </div>

            <v-bottom-navigation :active="active" color="indigo">
                <v-btn>
                    <v-icon>mdi-history</v-icon>

                    Recents
                </v-btn>

                <v-btn>
                    <v-icon>mdi-heart</v-icon>

                    Favorites
                </v-btn>

                <v-btn>
                    <v-icon>mdi-map-marker</v-icon>

                    Nearby
                </v-btn>
            </v-bottom-navigation>

        </v-layout>



        <v-card location="bottom">
            <v-tabs v-model="tab" bg-color="grey-lighten-1">
                <v-tab value="one">Item One</v-tab>
                <v-tab value="twi">Item Twooooo</v-tab>
                <v-tab v-on:click="onclick" value="three">Item Three</v-tab>
            </v-tabs>


            <v-navigation-drawer color="grey-lighten-3" rail>
                <v-avatar class="d-block text-center mx-auto mt-4" color="grey-darken-1" size="36"></v-avatar>

                <v-divider class="mx-3 my-5"></v-divider>

                <v-avatar v-for="n in 6" :key="n" class="d-block text-center mx-auto mb-9" color="grey-lighten-1"
                    size="28"></v-avatar>
            </v-navigation-drawer>

            <v-navigation-drawer width="244">
                <v-sheet color="grey-lighten-5" height="128" width="100%"></v-sheet>

                <v-list>
                    <v-list-item v-for="n in 5" :key="n" :title="`Item ${n}`" link></v-list-item>
                </v-list>
            </v-navigation-drawer>


            <v-card-text>
                <v-window v-model="tab">
                    <v-window-item value="one">
                        One
                    </v-window-item>

                    <v-window-item value="twi">
                        Twoeeeeeeeeee
                    </v-window-item>

                    <v-window-item value="three">
                        Three
                    </v-window-item>
                </v-window>
            </v-card-text>
        </v-card>

        <div class="divcontainer">
            <v-main style="height: 100%">
                <canvas id="pixiCanvas"></canvas>
            </v-main>
        </div>


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

        </v-navigation-drawer>



    </v-app>
</template>

<script lang="ts">
import { app_main } from "./piximain.ts"

export default {
    data() {
        return {
            tab: null,
            min: -50,
            max: 90,
            slider: 40,
        }
    },
    methods: {
        onclick() {

        }
    },
    mounted() {
        app_main()
    },



}
</script>
