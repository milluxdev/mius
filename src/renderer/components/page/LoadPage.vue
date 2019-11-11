<template>
  <div class="load-page">
    <Spin fix size="large" class="load-spin">Loading</Spin>
  </div>
</template>

<script>
  export default {
    name: 'load',
    created() {
      setTimeout(() => {
        this.$Spin.hide();
        this.$router.replace({
          name: '7210server'
        });
      }, 1000);
    }
  }
</script>
<style>
  .load-page {
    width: 100%;
    height: 100%;
    display: inline-block;
    position: relative;
  }
  .load-spin {
    padding-top: 500px;
  }
</style>