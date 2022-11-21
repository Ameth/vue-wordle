import { ref } from "vue";

export const message = ref("");

export const showMessage = (msg, time = 1000) => {
  message.value = msg;
  if (time > 0) {
    setTimeout(() => {
      message.value = "";
    }, time);
  }
};

// export default { showMessage, message };
