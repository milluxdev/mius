<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
  import {
    ipcRenderer as ipc
  } from 'electron';

  export default {
    name: 'm-music',
    methods: {},
    mounted() {
      let that = this
      ipc.on('message', (event, {
        message,
        data
      }) => {
        console.log(message)
        switch (message) {
          case 'update-available':
            that.$Message.info('正在检查更新');
            break;
          case 'error':
            that.$Message.error('检查更新失败');
            break;
          case 'is-update-now':
            that.$Modal.confirm({
              title: '更新提示',
              content: '<p>检测到新版本，是否立即更新？</p>',
              okText: "更新",
              onOk: () => {
                ipc.send("update");
              },
            });
            break;
        }
      });
    }
  }
</script>

<style>
  html,
  body,
  div {
    margin: 0;
    padding: 0;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  }
</style>