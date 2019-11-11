<template>
  <div class="side-bar">
    <Menu theme="dark" active-name="7210server" width="200" @on-select="menuSelectHandler">
      <MenuGroup :title="$t('sidebar.serverInfo')">
        <MenuItem name="7210server">
        <Icon type="ios-cloud"></Icon>YGOPro 7210
        </MenuItem>
        <MenuItem name="1311server" v-if="!isCn">
        <Icon type="ios-cloud"></Icon>YGOPro 1311
        </MenuItem>
        <MenuItem name="server" v-if="isCn">
        <Icon type="ios-cloud"></Icon>YGOPro 222
        </MenuItem>
        <MenuItem name="YGOCC" v-if="!isCn">
        <Icon type="ios-cloud"></Icon>YGOCC
        </MenuItem>
        <MenuItem name="NO81" v-if="!isCn">
        <Icon type="ios-cloud"></Icon>Server NO81
        </MenuItem>
        <MenuItem name="mcserver" v-if="isCn">
        <Icon type="ios-cloud"></Icon>MyCard
        </MenuItem>
      </MenuGroup>
      <MenuGroup :title="$t('sidebar.ygoInfo')">
        <MenuItem name="deck">
        <Icon type="md-list"></Icon>{{$t('sidebar.deckInfo')}}
        </MenuItem>
      </MenuGroup>
    </Menu>
  </div>
</template>
<script>
  export default {
    name: "SideBar",
    data() {
      return {
        isCn: true
      };
    },
    methods: {
      menuSelectHandler(name) {
        this.$router.replace({
          name
        });
      },
    },
    created() {
      let lang = localStorage.getItem('lang_setting') ? localStorage.getItem('lang_setting') : 'zh'
      if ('zh' === lang) {
        this.isCn = true
      } else if ('en' === lang) {
        this.isCn = false
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

  .bottom-area {
    position: absolute;
    bottom: 55px;
    width: 100%;
    padding-left: 5px;
  }
</style>