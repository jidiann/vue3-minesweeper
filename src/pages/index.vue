<script setup lang="ts" generic="T extends any, O extends any">
import { GamePlay, isDev, toggleDev } from '~/composables'

const borderSize = ref<number>(12)

const play = new GamePlay(borderSize.value, borderSize.value)
useStorage('vue3MineSweeper-state', play.state)
const state = computed(() => play.board)
function submit(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    if (borderSize.value < 5)
      return
    play.reset(borderSize.value)
  }
}
</script>

<template>
  <div>
    <div mb-1>
      vue3-minesweeper
      |
      board-size： <input v-model="borderSize" type="text" w-10 h-5 text-black text-xs @keydown="submit">
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
