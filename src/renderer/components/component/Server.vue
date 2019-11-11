<template>
  <div class="page">
    <Row>
      <div class="userinfo" style="padding-bottom: 5px;padding-top: 5px;padding-left: 5px;float: left">
        <label class="labelinfo" for="username">
          {{$t('server.username')}}:
          <Input v-model="username" :placeholder="$t('placeholder.username')" small style="width: 100px"
            id="username"></Input>
        </label>
        <label class="labelinfo" for="roomname">
          {{$t('server.room')}}:
          <Input v-model="roomname" :placeholder="$t('placeholder.room')" small style="width: 100px"
            id="roomname"></Input>
        </label>
        <label class="labelinfo" for="roomname">
          {{$t('server.model')}}:
          <Select v-model="roomtype" style="width:100px" id="roomtype">
            <Option v-for="item in roomtypes" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </label>
        <Button @click="create_room">{{$t('server.createRoom')}}</Button>
      </div>
      <div style="float: right;padding-bottom: 5px; padding-top: 2px; padding-right: 2px;">
        <Tag color="primary" @click.native="setting">{{$t('server.setting')}}</Tag>
      </div>
    </Row>
    <Row>
      <Table height="520" stripe :columns="columns" :data="datas"></Table>
    </Row>
    <Modal v-model="usermodal" :title="usertitle" :styles="{top: '150px'}">
      <div style="text-align:center">
        <Table height="240" :columns="user_columns" :data="user_datas"></Table>
      </div>
      <div slot="footer">
        <Button type="info" size="large" long @click="del">{{$t('server.close')}}</Button>
      </div>
    </Modal>
    <Modal v-model="settings" :title="$t('server.setting')" width="300" :closable="false">
      <Button @click="setok">{{$t('server.settingYgoMsg')}}</Button>
      <div slot="footer">
        <Button type="info" @click="setting_close">{{$t('server.close')}}</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import {
    remote
  } from "electron";
  const dialog = remote.dialog;
  import path from "path";

  export default {
    name: "server",
    data() {
      return {
        settings: false,
        gametype: ["", "M#", "T#", "AI"],
        roomtypes: [{
            value: "0",
            label: this.$t('server.single')
          },
          {
            value: "1",
            label: this.$t('server.match')
          },
          {
            value: "2",
            label: this.$t('server.tag')
          },
          {
            value: "3",
            label: "AI"
          }
        ],
        usertitle: this.$t('server.roomList'),
        serverinfo: {
          server: {
            url: "https://222diy.momobako.com:2221/api/getrooms",
            ip: "ayane.mycard.moe",
            port: 222,
            path: "ygopro_path_222"
          },
          "7210server": {
            url: "https://koishi.moecube.com:7215/api/getrooms",
            ip: "koishi.moecube.com",
            port: 7210,
            path: "ygopro_path_7210"
          },
          "1311server": {
            url: "https://koishi.moecube.com:1312/api/getrooms",
            ip: "koishi.moecube.com",
            port: 1311,
            path: "ygopro_path_1311"
          },
          "YGOCC": {
            url: "http://23.254.201.48:7922/api/getrooms",
            ip: "23.254.201.48",
            port: 7999,
            path: "ygopro_path_ygocc"
          },
          "NO81": {
            url: "http://154.209.234.205:7922/api/getrooms",
            ip: "154.209.234.205",
            port: 11037,
            path: "ygopro_path_NO81"
          }
        },
        user_columns: [{
            title: this.$t('server.pos'),
            key: "pos"
          },
          {
            title: this.$t('server.username'),
            key: "username"
          },
          {
            title: this.$t('server.score'),
            key: "score"
          },
          {
            title: this.$t('server.lp'),
            key: "lp"
          },
          {
            title: this.$t('server.cards'),
            key: "cards"
          }
        ],
        user_datas: [],
        columns: [{
            title: this.$t('server.roomId'),
            key: "roomid",
            width: 100
          },
          {
            title: this.$t('server.roomname'),
            key: "roomname",
            align: "center"
          },
          {
            title: this.$t('server.user'),
            key: "user",
            width: 100,
            align: "center",
            render: (h, params) => {
              return h("div", [
                h(
                  "Button", {
                    props: {
                      type: "info",
                      size: "small"
                    },
                    on: {
                      click: () => {
                        this.showUser(params.index);
                      }
                    }
                  },
                  this.$t('server.showUser')
                )
              ]);
            }
          },
          {
            title: this.$t('server.gameStatus'),
            key: "istart",
            width: 150,
            align: "center"
          },
          {
            title: this.$t('server.operate'),
            key: "action",
            width: 100,
            align: "center",
            render: (h, params) => {
              return h("div", [
                h(
                  "Button", {
                    props: {
                      type: "primary",
                      size: "small"
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.joinRoom(params.index);
                      }
                    }
                  },
                  this.$t('server.joinGame')
                )
              ]);
            }
          }
        ],
        datas: [],
        usermodal: false,
        timer: null,
        roomtype: "1",
        username: "",
        roomname: ""
      };
    },
    methods: {
      setting_close() {
        this.settings = false;
      },
      setting() {
        this.settings = true;
      },
      showErrorMsg(msg) {
        this.$Message.error(msg);
      },
      create_room() {
        let that = this;
        let ygopro_path = this.serverinfo[that.$route.name].path;
        if (that.username == "") {
          this.$Message.error(this.$t('server.usernameError'));
          return;
        }
        that.$db.findOne({
            name: ygopro_path
          },
          (err, ret) => {
            if (ret == null) {
              that.showErrorMsg(this.$t('server.settingMsg'))
              that.settings = true;
            } else {
              let ip = that.serverinfo[that.$route.name].ip;
              let port = that.serverinfo[that.$route.name].port;
              if (that.roomtype != 3) {
                that.$ygo.joinGame(
                  ret.dir,
                  ret.path,
                  ip,
                  port,
                  that.username,
                  that.gametype[that.roomtype] + that.roomname
                );
              } else {
                that.$ygo.joinGame(
                  ret.dir,
                  ret.path,
                  ip,
                  port,
                  that.username,
                  that.gametype[that.roomtype]
                );
              }
            }
          }
        );
        that.$db.findOne({
            name: "username"
          },
          (err, ret) => {
            if (ret == null) {
              that.$db.insert({
                  name: "username",
                  value: that.username
                },
                (err, ret) => {}
              );
            } else {
              that.$db.update({
                  name: "username"
                }, {
                  $set: {
                    name: "username",
                    value: that.username
                  }
                },
                (err, ret) => {}
              );
            }
          }
        );
      },
      setok() {
        let that = this;
        let ygopro_path = this.serverinfo[that.$route.name].path;
        dialog.showOpenDialog({
            title: this.$t('server.settingYgoMsg'),
            properties: ["openFile"],
            filters: [{
              name: "Exe",
              extensions: ["exe"]
            }]
          },
          function (filenames) {
            if (filenames != null) {
              let dir = path.resolve(filenames[0], "..");
              let ygopath = filenames[0];
              that.$db.findOne({
                  name: ygopro_path
                },
                (err, ret) => {
                  if (ret == null) {
                    that.$db.insert({
                        name: ygopro_path,
                        path: ygopath,
                        dir: dir
                      },
                      (err, ret) => {
                        if (err == null) {
                          that.$Message.success(that.$t('server.settingYgoSuccess'));
                        } else {
                          that.$Message.error(that.$t('server.settingYgoError'));
                        }
                      }
                    );
                  } else {
                    that.$db.update({
                        name: ygopro_path
                      }, {
                        $set: {
                          name: ygopro_path,
                          path: ygopath,
                          dir: dir
                        }
                      },
                      (err, ret) => {
                        if (err == null) {
                          that.$Message.success(that.$t('server.settingYgoSuccess'));
                        } else {
                          that.$Message.error(that.$t('server.settingYgoError'));
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      },
      joinRoom(index) {
        let that = this;
        let ygopro_path = this.serverinfo[that.$route.name].path;
        if (that.username == "") {
          this.$Message.error(this.$t('server.usernameError'));
          return;
        }
        let roomname = this.datas[index].roomname;
        that.$db.findOne({
            name: ygopro_path
          },
          (err, ret) => {
            if (ret == null) {
              that.showErrorMsg(this.$t('server.settingMsg'))
              that.settings = true;
            } else {
              let ip = that.serverinfo[that.$route.name].ip;
              let port = that.serverinfo[that.$route.name].port;
              console.log(ret);
              that.$ygo.joinGame(
                ret.dir,
                ret.path,
                ip,
                port,
                that.username,
                roomname
              );
            }
          }
        );
        that.$db.findOne({
            name: "username"
          },
          (err, ret) => {
            if (ret == null) {
              that.$db.insert({
                  name: "username",
                  value: that.username
                },
                (err, ret) => {}
              );
            } else {
              that.$db.update({
                  name: "username"
                }, {
                  $set: {
                    name: "username",
                    value: that.username
                  }
                },
                (err, ret) => {}
              );
            }
          }
        );
      },
      del() {
        this.usermodal = false;
      },
      showUser(index) {
        this.usertitle = this.$t('server.room') + "：" + this.datas[index].roomname;
        this.user_datas = [];
        const roommode = this.datas[index].roommode;
        let users = this.datas[index].users;
        if (users.length) {
          for (let i = 0; i < users.length; i++) {
            let user = {};
            let pos = users[i].pos;
            if (roommode == 2) {
              user.pos = pos == 0 || pos == 1 ? this.$t('server.posA') : this.$t('server.posB');
            } else {
              user.pos = pos == 0 ? this.$t('server.posA') : this.$t('server.posB');
            }
            let cellClassName = {};
            if (user.pos == this.$t('server.posA')) {
              cellClassName.pos = "class-table-A";
            } else if (user.pos == this.$t('server.posB')) {
              cellClassName.pos = "class-table-B";
            }
            user.cellClassName = cellClassName;
            user.username = users[i].name;
            if (users[i].status != null) {
              user.score = users[i].status.score;
              user.lp = users[i].status.lp;
              user.cards = users[i].status.cards;
            }
            if (pos < 4) {
              this.user_datas.push(user);
            }
          }
        }
        this.usermodal = true;
      },
      showData() {
        let that = this;
        let url = this.serverinfo[this.$route.name].url;
        this.$http.get(url).then(function (response) {
          that.datas = [];
          let rooms = response.data.rooms;
          if (rooms.length) {
            for (let index = 0; index < rooms.length; index++) {
              let room = {};
              room.roomid = rooms[index].roomid;
              room.roomname = rooms[index].roomname;
              room.roommode = rooms[index].roommode;
              room.needpass = rooms[index].needpass;
              room.istart = rooms[index].istart;
              if (room.istart == "wait") {
                room.istart = that.$t('server.waiting');
                room.sort = 1;
              } else {
                room.sort = 0;
              }
              room.users = rooms[index].users;
              that.datas.push(room);
              that.datas.sort(function (room_a, room_b) {
                return room_b.sort - room_a.sort;
              });
            }
          }
        });
      }
    },
    created() {
      this.showData();
      this.timer = setInterval(this.showData, 3000);
      this.$Notice.config({
        top: 100
      });
      let that = this;
      that.$db.findOne({
          name: "username"
        },
        (err, ret) => {
          if (ret != null) {
            that.username = ret.value;
          }
        }
      );
    },
    mounted() {},
    beforeDestroy() {
      if (this.timer) {
        clearInterval(this.timer);
      }
    },
    components: {}
  };
</script>

<style>
  .labelinfo {
    padding-left: 10px;
  }

  .ivu-table .class-table-A {
    background-color: #2db7f5;
    color: #fff;
  }

  .ivu-table .class-table-B {
    background-color: #ff6600;
    color: #fff;
  }
</style>