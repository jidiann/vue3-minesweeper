<script setup lang="ts" generic="T extends any, O extends any">
import { GamePlay, isDev, toggleDev } from '~/composables'

const borderSize = ref<number>(5)
const mines = ref<number>(3)

const play = new GamePlay(borderSize.value, borderSize.value, mines.value)

useStorage('vue3MineSweeper-state', play.state)

const now = $(useNow())
const timerMS = $computed(() => Math.round(((play.state.value.endMS ?? +now) - (play.state.value.startMS ?? +now)) / 1000))

const board = $computed(() => play.board)

const mineCount = $computed(() => {
  return play.blocks.reduce((a, b) => a + (b.mine ? 1 : 0), 0)
})

function submit(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    if (borderSize.value < 5)
      return
    play.reset(borderSize.value, borderSize.value, mines.value)
  }
}

function newGame(difficulty: 'easy' | 'medium' | 'hard') {
  switch (difficulty) {
    case 'easy':
      play.reset(9, 9, 10)
      break
    case 'medium':
      play.reset(16, 16, 40)
      break
    case 'hard':
      play.reset(16, 30, 99)
      break
  }
}

watchEffect(() => {
  play.checkGameState()
})
</script>

<template>
  <div>
    <div mb-1>
      vue3-minesweeper
      <span v-if="isDev">
        |
        board-size： <input v-model="borderSize" type="text" w-10 h-5 text-black text-xs @keydown="submit">
      </span>
    </div>

    <div flex justify-center>
      <div font-mono flex="~ gap-1" items-center>
        <div i-carbon:timer />
        {{ timerMS }}
      </div>
    </div>

    <div flex="~ gap-1" justify-center>
      <button btn border @click="play.reset()">
        New Game
      </button>
      <button btn @click="newGame('easy')">
        Easy
      </button>
      <button btn @click="newGame('medium')">
        Medium
      </button>
      <button btn @click="newGame('hard')">
        Hard
      </button>
    </div>

    <div p5 w-full overflow-auto>
      <div
        v-for="row, y in board"
        :key="y"
        flex="~"
        items-center justify-center
        w-max ma
      >
        <MineBlock
          v-for="block, x in row"
          :key="x"
          :block="block"
          @click="play.blockClick(block)"
          @lrclick="play.autoExpand(block)"
          @contextmenu.prevent="play.blockFlag(block)"
        />
      </div>
    </div>

    <div flex="~ gap-1" justify-center mt-7>
      <button btn border @click="toggleDev()">
        {{ isDev ? 'DEV' : 'NORMAL' }}
      </button>

      <div v-if="isDev">
        mineCount: {{ mineCount }}
      </div>
    </div>
  </div>

  <Confetti :passed="play.state.value.status === 'won'" />
</template>
