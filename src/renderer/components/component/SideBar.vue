<template>
  <div class="side-bar">
    <Menu theme="dark" active-name="7210server" width="200" @on-select="menuSelectHandler">
      <MenuGroup title="服务器信息">
        <MenuItem name="7210server">
          <Icon type="ios-cloud"></Icon>YGOPro 7210
        </MenuItem>
        <MenuItem name="1311server">
          <Icon type="ios-cloud"></Icon>YGOPro 1311
        </MenuItem>
        <MenuItem name="server">
          <Icon type="ios-cloud"></Icon>YGOPro 222
        </MenuItem>
        <MenuItem name="mcserver">
          <Icon type="ios-cloud"></Icon>MyCard
        </MenuItem>
      </MenuGroup>
      <MenuGroup title="YGO信息">
        <MenuItem name="deck">
          <Icon type="md-list"></Icon>卡组信息
        </MenuItem>
        <!--
                <MenuItem name="xpg">
                <Icon type="android-apps"></Icon>
                上位卡组
                </MenuItem>
        -->
      </MenuGroup>
    </Menu>
  </div>
</template>
<script>
export default {
  name: "SideBar",
  data() {
    return {};
  },
  methods: {
    menuSelectHandler(name) {
      this.$router.replace({
        name
      });
    }
  }
};
</script>

<style>
.side-bar {
  width: 200px;
  background-color: #324157;
  transition: width 0.3s ease;
  height: 100%;
  overflow-x: hidden;
}

.side-bar::-webkit-scrollbar {
  width: 10px;
  height: 1px;
  background-color: #324157;
}

.side-bar::-webkit-scrollbar-thumb {
  border-radius: 5px;
  -webkit-box-shadow: inset 0 0 5px rgba(128, 128, 128, 0.5);
  background: #778899;
}
</style>