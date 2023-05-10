<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
      <p/>
      <p/>
      <input v-model="playerName" placeholder="输入昵称"/>
      <p/>
      <p/>
      <button @click="joinGame">
          进入游戏
      </button>
  </div>
</template>

<script>
import router from "@/router";

export default {
    data() {
        return {
            playerName:''
        }
    },
  name: 'HelloWorld',
  props: {
    msg: String
  },
  methods: {
      joinGame() {
          console.log(this.playerName);
          router.push({ name: 'game', params: { playerName: this.playerName }})
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

h1 {
    padding-top: 50px;
    color: goldenrod;
    text-shadow: 1px 1px antiquewhite;
}

input {
    margin: 100px 0 50px 0;
    padding-left: 6px;
    padding-right: 6px;
    height: 40px;
    width: 300px;
}

button {
    height: 30px;
    width: 120px;
    margin-bottom: 200px;
}

.hello {
    width: 100%;
    height: 100%;
    background-image: url("~@/assets/texas_logo.png");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}
</style>
