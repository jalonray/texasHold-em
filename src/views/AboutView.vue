<template>
  <div class="game">
    <TexasHoldem/>
  </div>
</template>
<script>
import {defineComponent} from "vue";
import TexasHoldem from "@/components/TexasHoldem.vue";

export default defineComponent({
    components: {TexasHoldem}
})
</script>