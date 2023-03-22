<script setup lang="ts" generic="T extends any, O extends any">
import { GamePlay, isDev, toggleDev } from '~/composables'

const play = new GamePlay(12, 12)
const state = play.state
</script>

<template>
  <div>
    <div mb-1>
      vue3-minesweeper
    </div>

    <div
      v-for="row, y in state"
      :key="y"
      flex="~"
      items-center justify-center
    >
      <MineBlock
        v-for="block, x in row"
        :key="x"
        :block="block"
        @click="play.blockClick(block)"
        @contextmenu.prevent="play.blockFlag(block)"
      />
    </div>

    <div flex="~ gap-1" justify-center mt-7>
      <button btn border @click="toggleDev()">
        {{ isDev ? 'DEV' : 'NORMAL' }}
      </button>
      <button btn border @click="play.reset()">
        REST
      </button>
    </div>
  </div>
</template>
