<script setup lang="ts" generic="T extends any, O extends any">
import type { BlockState } from '~/type'

const HEIGHT = 5 // 棋盘高度
const WIDTH = 5 // 棋盘宽度
// 初始化棋盘
const state = ref(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH },
      (_, x): BlockState => ({
        x,
        y,
        reveoled: false,
        mine: false,
        flagged: false,
        adjacentMines: 0,
      }),
    ),
  ),
)

// 生成炸弹
function generateMines(initial: BlockState) {
  state.value.forEach(row =>
    row.forEach((block) => {
      if (Math.abs(initial.x - block.x) <= 1)
        return
      if (Math.abs(initial.y - block.y) <= 1)
        return
      block.mine = Math.random() < 0.9
    },
    ),
  )
  updateNumbers()
}

// 自动展开
function expendZero(block: BlockState) {
  if (block.adjacentMines)
    return

  getSiblings(block)
    .forEach((b) => {
      if (!b.reveoled) {
        b.reveoled = true
        expendZero(b)
      }
    })
}

// 方向
const directions = [
  [1, 1],
  [1, 0],
  [1, -1],
  [-1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
]

// 初始化数字
function updateNumbers() {
  state.value.forEach(row =>
    row.forEach((block) => {
      if (block.mine)
        return

      getSiblings(block)
        .forEach((b) => {
          if (b.mine)
            block.adjacentMines += 1
        })
    },
    ),
  )
}

// 获取边界
function getSiblings(block: BlockState) {
  return directions.map(([dx, dy]) => {
    const x2 = block.x + dx
    const y2 = block.y + dy

    if (x2 < 0 || x2 >= HEIGHT || y2 < 0 || y2 >= WIDTH)
      return undefined

    return state.value[y2][x2]
  })
    .filter(Boolean) as BlockState[]
}

// 字体颜色
const numberColors = [
  'text-transparent',
  'text-gray-500',
  'text-green-500',
  'text-blue-500',
  'text-yellow-500',
  'text-orange-500',
  'text-pink-500',
  'text-teal-500',
  'text-red-500',
]

// 决定块样式
function getBlockClass(block: BlockState) {
  if (block.flagged)
    return 'bg-gray-500/10'
  if (!block.reveoled)
    return 'bg-gray-500/10 hover:bg-gray-500/20'

  return block.mine ? 'bg-red/50 ' : numberColors[block.adjacentMines]
}

let mineGenerated = false // 是否初始化炸弹
const dev = false // 是否开启作弊模式

// 左键点击事件
function blockClick(block: BlockState) {
  if (block.flagged)
    return

  if (!mineGenerated) {
    generateMines(block)
    mineGenerated = true
  }

  block.reveoled = true

  if (block.mine)
    alert('BOOM!')
  else
    checkGameState()

  expendZero(block)
}

// 插旗
function blockFlag(block: BlockState) {
  if (block.reveoled)
    return

  block.flagged = !block.flagged

  checkGameState()
}

// watchEffect(checkGameState)

// 监控游戏状态
function checkGameState() {
  if (!mineGenerated)
    return

  const blocks = state.value.flat()

  if (blocks.every(block => block.reveoled || block.flagged)) {
    console.log(blocks)

    if (blocks.some(block => block.flagged && !block.mine))
      alert('YOU CHEAT!')
    else
      alert('YOU WIN!')
  }
}
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
      <button
        v-for="block, x in row"
        :key="x"
        flex="~"
        items-center justify-center
        w-10 h-10
        border="1 gray-400/10"
        :class="getBlockClass(block)"
        @click="blockClick(block)"
        @contextmenu.prevent="blockFlag(block)"
      >
        <template v-if="block.flagged">
          <div i-mdi:flag text-red />
        </template>
        <template v-else-if="block.reveoled || dev">
          <div v-if="block.mine" i-mdi:mine />
          <div v-else>
            {{ block.adjacentMines }}
          </div>
        </template>
      </button>
    </div>
  </div>
</template>
