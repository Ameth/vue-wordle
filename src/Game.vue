<script setup>
import { onUnmounted, ref, computed, reactive } from 'vue'
import confetti from 'canvas-confetti'
import { getWordOfTheDay, allWords } from '@/utils/words'
import Keyboard from '@/components/Keyboard.vue'
import { LetterState, resultWords } from '@/utils/types'
import GithubIcon from '@/icons/GithubIcon.vue'
import InstructIcon from '@/icons/InstructIcon.vue'
import SendIcon from '@/icons/SendIcon.vue'
import Instructions from '@/components/Instructions.vue'
import Send from '@/components/Send.vue'
import { showMessage, message } from '@/store/store.js'

// Get word of the day
const answer = getWordOfTheDay()

// console.log('Answer:', answer)

// Board state. Each tile is represented as { letter, state }
const board = ref(
  Array.from({ length: 6 }, () =>
    Array.from({ length: 5 }, () => ({
      letter: '',
      state: LetterState.INITIAL
    }))
  )
)

// Current active row.
let currentRowIndex = ref(0)
const currentRow = computed(() => board.value[currentRowIndex.value])

// console.log("current:", currentRow.value);

// Feedback state: message and shake
// let message = ref('')
let grid = ref('')
let shakeRowIndex = ref(-1)
let success = ref(false)
let isActiveModal = ref(false)
let modalInfo = ref('')

// Keep track of revealed letters for the virtual keyboard
const letterStates = reactive({})

// Handle keyboard input.
let allowInput = ref(true)

const onKeyup = e => {
  // console.log(e.key);
  onKey(e.key)
}

window.addEventListener('keyup', onKeyup)

onUnmounted(() => {
  window.removeEventListener('keyup', onKeyup)
})

function onKey(key) {
  if (!allowInput.value) return
  if (/^[a-zA-Z\u00f1\u00d1]$/.test(key)) {
    fillTile(key.toLowerCase())
  } else if (key === 'Backspace') {
    clearTile()
  } else if (key === 'Enter') {
    completeRow()
  }
}

function fillTile(letter) {
  // console.log(currentRow);

  for (const tile of currentRow.value) {
    if (!tile.letter) {
      tile.letter = letter
      break
    }
  }
}

function clearTile() {
  for (const tile of [...currentRow.value].reverse()) {
    if (tile.letter) {
      tile.letter = ''
      break
    }
  }
}

function completeRow() {
  if (currentRow.value.every(tile => tile.letter)) {
    const guess = currentRow.value.map(tile => tile.letter).join('')
    // if (!allWords.includes(guess) && guess !== answer) {
    //   shake()
    //   showMessage(`La palabra no está en la lista`)
    //   return
    // }

    const answerLetters = answer.split('')
    // Primer paso: marcar las letras correctas
    currentRow.value.forEach((tile, i) => {
      if (answerLetters[i] === tile.letter) {
        tile.state = letterStates[tile.letter] = LetterState.CORRECT
        answerLetters[i] = null
      }
    })
    // Segundo paso: marcar las letras presentes
    currentRow.value.forEach(tile => {
      if (!tile.state && answerLetters.includes(tile.letter)) {
        tile.state = LetterState.PRESENT
        answerLetters[answerLetters.indexOf(tile.letter)] = null
        if (!letterStates[tile.letter]) {
          letterStates[tile.letter] = LetterState.PRESENT
        }
      }
    })
    // Tercer paso: marcar las letras ausentes
    currentRow.value.forEach(tile => {
      if (!tile.state) {
        tile.state = LetterState.ABSENT
        if (!letterStates[tile.letter]) {
          letterStates[tile.letter] = LetterState.ABSENT
        }
      }
    })

    allowInput.value = false
    if (currentRow.value.every(tile => tile.state === LetterState.CORRECT)) {
      // Ganaste!!
      setTimeout(() => {
        grid.value = genResultGrid()
        showMessage(resultWords[currentRowIndex.value], -1)
        success.value = true
        confetti()
      }, 1600)
    } else if (currentRowIndex.value < board.value.length - 1) {
      // Ir a la siguiente fila
      currentRowIndex.value++
      setTimeout(() => {
        allowInput.value = true
      }, 1600)
    } else {
      // Juego perdido :(
      setTimeout(() => {
        showMessage(answer.toUpperCase(), -1)
      }, 1600)
    }
  } else {
    shake()
    showMessage('No pueden faltar letras')
  }
}

// function showMessage (msg, time = 1000) {
//   message.value = msg
//   if (time > 0) {
//     setTimeout(() => {
//       message.value = ''
//     }, time)
//   }
// }

function shake() {
  shakeRowIndex.value = currentRowIndex.value
  setTimeout(() => {
    shakeRowIndex.value = -1
  }, 1000)
}

const icons = {
  [LetterState.CORRECT]: '🟩',
  [LetterState.PRESENT]: '🟨',
  [LetterState.ABSENT]: '⬜',
  [LetterState.INITIAL]: null
}

function genResultGrid() {
  return board.value
    .slice(0, currentRowIndex.value + 1)
    .map(row => {
      return row.map(tile => icons[tile.state]).join('')
    })
    .join('\n')
}
</script>

<template>
  <Transition>
    <div class="message" v-if="message">
      {{ message }}
      <pre v-if="grid">{{ grid }}</pre>
    </div>
  </Transition>
  <header>
    <h1>WORDLE ESPAÑOL</h1>
    <a id="source-link" href="https://github.com/Ameth/vue-wordle" target="_blank" class="source-link" title="Github">
      <GithubIcon />
    </a>
  </header>
  <div class="icons">
    <a id="instructions" href="#" title="Instrucciones" class="icon-link"
      @click="; (isActiveModal = true), (modalInfo = 'Inst')">
      <InstructIcon />
    </a>
    <a id="send" href="#" title="Retar a un amigo" class="icon-link" @click="
                  ; (isActiveModal = true), (modalInfo = 'Send'), (allowInput = false)
                ">
      <SendIcon />
    </a>
    </div>
    <div id="board">
      <div v-for="(row, index) in board" :class="[
                  'row',
                  shakeRowIndex === index && 'shake',
                  success && currentRowIndex === index && 'jump'
                ]">
        <div v-for="(tile, index) in row" :class="['tile', tile.letter && 'filled', tile.state && 'revealed']">
          <div class="front" :style="{ transitionDelay: `${index * 300}ms` }">
            {{ tile.letter }}
          </div>
          <div :class="['back', tile.state]" :style="{
                      transitionDelay: `${index * 300}ms`,
                      animationDelay: `${index * 100}ms`
        }">
          {{ tile.letter }}
        </div>
      </div>
    </div>
  </div>
  <Keyboard @key="onKey" :letter-states="letterStates" />
  <div class="overlay" id="overlay" :class="{ active: isActiveModal }"></div>
  <div class="modal" id="modal" :class="{ active: isActiveModal }">
    <div class="modal-content">
      <button class="btn-close-modal" @click="; (isActiveModal = false), (modalInfo = ''), (allowInput = true)">
        X
      </button>
      <Instructions v-if="modalInfo == 'Inst'" />
      <Send v-if="modalInfo == 'Send'" />
    </div>
  </div>
</template>

<style scoped>
#board {
  display: grid;
  grid-template-rows: repeat(6, 1fr);
  grid-gap: 5px;
  padding: 10px;
  box-sizing: border-box;
  --height: min(420px, calc(var(--vh, 100vh) - 310px));
  height: var(--height);
  width: min(350px, calc(var(--height) / 6 * 5));
  margin: 0px auto;
  color: #eff3f8;
}

.message {
  position: absolute;
  left: 50%;
  top: 80px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.85);
  padding: 16px 20px;
  z-index: 2;
  border-radius: 4px;
  transform: translateX(-50%);
  transition: opacity 0.3s ease-out;
  font-weight: 600;
}

.message.v-leave-to {
  opacity: 0;
}

.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 5px;
}

.tile {
  width: 100%;
  font-size: 2rem;
  line-height: 2rem;
  font-weight: bold;
  vertical-align: middle;
  text-transform: uppercase;
  user-select: none;
  position: relative;
}

.tile.filled {
  animation: zoom 0.2s;
}

.tile .front,
.tile .back {
  box-sizing: border-box;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.tile .front {
  border: 2px solid #d3d6da;
}

.tile.filled .front {
  border-color: #999;
}

.tile .back {
  transform: rotateX(180deg);
}

.tile.revealed .front {
  transform: rotateX(180deg);
}

.tile.revealed .back {
  transform: rotateX(0deg);
}

@keyframes zoom {
  0% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

.shake {
  animation: shake 0.5s;
}

@keyframes shake {
  0% {
    transform: translate(1px);
  }

  10% {
    transform: translate(-2px);
  }

  20% {
    transform: translate(2px);
  }

  30% {
    transform: translate(-2px);
  }

  40% {
    transform: translate(2px);
  }

  50% {
    transform: translate(-2px);
  }

  60% {
    transform: translate(2px);
  }

  70% {
    transform: translate(-2px);
  }

  80% {
    transform: translate(2px);
  }

  90% {
    transform: translate(-2px);
  }

  100% {
    transform: translate(1px);
  }
}

.jump .tile .back {
  animation: jump 0.5s;
}

@keyframes jump {
  0% {
    transform: translateY(0px);
  }

  20% {
    transform: translateY(5px);
  }

  60% {
    transform: translateY(-25px);
  }

  90% {
    transform: translateY(3px);
  }

  100% {
    transform: translateY(0px);
  }
}

@media (max-height: 680px) {
  .tile {
    font-size: 3vh;
  }
}
</style>
