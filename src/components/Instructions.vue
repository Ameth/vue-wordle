<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'

const text = ref(`
## ¿Cómo jugar Wordle?

El objetivo del juego es adivinar la palabra de 5 letras que ha generado el juego para ti.`)

const textFormated = computed(() => {
  return marked(text.value)
})
</script>

<template>
  <div v-html="textFormated"></div>
</template>
