<template>
  <div class="main-page">
    <TitleBar />
    <SideBar />
    <div class="content-wrapper">
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </div>
  </div>
</template>

<script>
  import SideBar from './component/SideBar';
  import TitleBar from './component/TitleBar';
  export default {
    name: 'home',
    data() {
      return {}
    },
    components: {
      SideBar,
      TitleBar
    },
    methods: {

    }
  }
</script>

<style>
  .main-page {
    -webkit-user-select: none;
  }

  .side-bar {
    position: fixed;
    left: 0;
    top: 60;
  }

  .content-wrapper {
    margin-left: 200px;
    transition: margin-left 0.3s ease;
    top: 60;
  }
</style>