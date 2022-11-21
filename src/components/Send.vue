<template>
  <div class="content">
    <input
      type="text"
      name="word"
      id="word"
      placeholder="Escribe tu palabra"
      maxlength="5"
      v-model="word"
    />
    <h3>Envíale este enlace a tu amigo</h3>
    <div class="link-send" id="link">
      https://vue-wordle-spanish.netlify.app/?{{ wordCodified }}
    </div>
    <button @click="copyToClipBoard" :disabled="disableButton">
      Copiar enlace
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showMessage } from '@/store/store.js'
import CopyIcon from '@/icons/CopyIcon.vue'

const word = ref('')
const disableButton = ref(true)

const wordCodified = computed(() => {
  if (word.value.length === 5) {
    disableButton.value = false
    return btoa(word.value)
  } else {
    disableButton.value = true
    return ''
  }
})

const copyToClipBoard = () => {
  // Crea un campo de texto "oculto"
  var aux = document.createElement('input')

  // Asigna el contenido del elemento especificado al valor del campo
  aux.setAttribute('value', document.getElementById('link').innerHTML)

  // Añade el campo a la página
  document.body.appendChild(aux)

  // Selecciona el contenido del campo
  aux.select()

  //   console.log(aux.value)

  // Copia el texto seleccionado
  document.execCommand('copy')

  showMessage('¡Copiado!')

  // Elimina el campo de la página
  document.body.removeChild(aux)
}
</script>

<style scoped>
.content {
  display: flex;
  justify-content: center;
  flex-direction: column;
}

input {
  background-color: #121f3d;
  border: 0;
  color: #eff3f8;
  font-size: 0.875rem;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
  margin-top: 20px;
  text-align: center;
  font-size: 1.5em;
  font-weight: bold;
}

h3 {
  text-align: center;
}

.link-send {
  margin: 10px 0px 30px 0px;
  font-size: 1.5em;
  text-align: center;
  font-weight: bold;
  color: #33b1ff;
}

button {
  background-color: black;
  cursor: pointer;
  border: none;
  padding: 16px 32px;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 700;
  position: relative;
  border-radius: 12px;
}

button:disabled {
  color: gray;
  border-color: gray;
  border: 1px solid;
  cursor: initial;
}

button:enabled::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg,
    red,
    blue,
    deeppink,
    blue,
    red,
    blue,
    deeppink,
    blue
  );
  background-size: 800%;
  border-radius: 10px;
  filter: blur(8px);
  animation: glowing 20s linear infinite;
}

@keyframes glowing {
  0% {
    background-position: 0 0;
  }

  50% {
    background-position: 400% 0;
  }

  100% {
    background-position: 0 0;
  }
}

/*button {
  background: #121f3d;
  border: 1px solid #33b1ff;
  border-radius: 0.5rem;
  color: #33b1ff;
  box-sizing: border-box;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.5rem 1rem;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  cursor: pointer;
}

button:hover {
  border: 1px solid #74caff;
  color: #74caff;
} */
</style>
