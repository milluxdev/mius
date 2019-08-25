<template>
  <div class="page">
    <Row>
      <div
        class="userinfo"
        style="padding-bottom: 5px;padding-top: 5px;padding-left: 5px;float: left"
      >
        <label class="labelinfo" for="username">
          用户名:
          <Input v-model="username" placeholder="请输入用户名" small style="width: 100px" id="username"></Input>
        </label>
        <label class="labelinfo" for="roomname">
          房间名:
          <Input v-model="roomname" placeholder="请输入房间名" small style="width: 100px" id="roomname"></Input>
        </label>
        <label class="labelinfo" for="roomname">
          游戏模式：
          <Select v-model="roomtype" style="width:100px" id="roomtype">
            <Option v-for="item in roomtypes" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </label>
        <Button @click="create_room">创建房间</Button>
      </div>
      <div style="float: right;padding-bottom: 5px; padding-top: 2px; padding-right: 2px;">
        <Tag color="primary" @click.native="setting">设置</Tag>
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
        <Button type="info" size="large" long @click="del">关闭</Button>
      </div>
    </Modal>
    <Modal v-model="joinmodal" title="提示" width="300" @on-ok="setok">
      <p>没有配置YGOPro，是否配置YGOPro</p>
    </Modal>
    <Modal v-model="settings" title="配置" width="300" :closable="false">
      <Button @click="setok">配置YGOPro</Button>
      <div slot="footer">
        <Button type="info" @click="setting_close">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { remote } from "electron";
const dialog = remote.dialog;
import path from "path";

export default {
  name: "server",
  data() {
    return {
      settings: false,
      gametype: ["", "M#", "T#", "AI"],
      roomtypes: [
        {
          value: "0",
          label: "单局"
        },
        {
          value: "1",
          label: "比赛"
        },
        {
          value: "2",
          label: "双打"
        },
        {
          value: "3",
          label: "AI"
        }
      ],
      usertitle: "玩家列表",
      serverinfo: {
        server: {
          url: "https://ayane.mycard.moe:2221/api/getrooms",
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
        }
      },
      user_columns: [
        {
          title: "玩家阵营",
          key: "pos"
        },
        {
          title: "玩家名称",
          key: "username"
        },
        {
          title: "比分",
          key: "score"
        },
        {
          title: "基本分",
          key: "lp"
        },
        {
          title: "当前卡数",
          key: "cards"
        }
      ],
      user_datas: [],
      columns: [
        {
          title: "房间Id",
          key: "roomid",
          width: 100
        },
        {
          title: "房间名称",
          key: "roomname",
          align: "center"
        },
        {
          title: "玩家",
          key: "user",
          width: 100,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
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
                "查看玩家"
              )
            ]);
          }
        },
        {
          title: "游戏状态",
          key: "istart",
          width: 150,
          align: "center",
          filters: [
            {
              label: "等待加入",
              value: 2
            },
            {
              label: "正在游戏",
              value: 1
            }
          ],
          filterMultiple: false,
          filterMethod(value, row) {
            if (value == 1) {
              return row.istart !== "等待加入";
            } else if (value == 2) {
              return row.istart == "等待加入";
            }
          }
        },
        {
          title: "操作",
          key: "action",
          width: 100,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
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
                "加入房间"
              )
            ]);
          }
        }
      ],
      datas: [],
      usermodal: false,
      joinmodal: false,
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
    create_room() {
      let that = this;
      let ygopro_path = this.serverinfo[that.$route.name].path;
      if (that.username == "") {
        this.$Message.error("请输入用户名");
        return;
      }
      that.$db.findOne(
        {
          name: ygopro_path
        },
        (err, ret) => {
          if (ret == null) {
            that.joinmodal = true;
          } else {
            let ip = that.serverinfo[that.$route.name].ip;
            let port = that.serverinfo[that.$route.name].port;
            console.log(ret);
            console.log(ip);
            console.log(port);
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
      that.$db.findOne(
        {
          name: "username"
        },
        (err, ret) => {
          if (ret == null) {
            that.$db.insert(
              {
                name: "username",
                value: that.username
              },
              (err, ret) => {}
            );
          } else {
            that.$db.update(
              {
                name: "username"
              },
              {
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
      dialog.showOpenDialog(
        {
          title: "配置Ygopro",
          properties: ["openFile"],
          filters: [
            {
              name: "Exe",
              extensions: ["exe"]
            }
          ]
        },
        function(filenames) {
          if (filenames != null) {
            let dir = path.resolve(filenames[0], "..");
            let ygopath = filenames[0];
            that.$db.findOne(
              {
                name: ygopro_path
              },
              (err, ret) => {
                if (ret == null) {
                  that.$db.insert(
                    {
                      name: ygopro_path,
                      path: ygopath,
                      dir: dir
                    },
                    (err, ret) => {
                      if (err == null) {
                        that.$Message.success("配置Ygopro成功");
                      } else {
                        that.$Message.error("配置Ygopro失败");
                      }
                    }
                  );
                } else {
                  that.$db.update(
                    {
                      name: ygopro_path
                    },
                    {
                      $set: {
                        name: ygopro_path,
                        path: ygopath,
                        dir: dir
                      }
                    },
                    (err, ret) => {
                      if (err == null) {
                        that.$Message.success("配置Ygopro成功");
                      } else {
                        that.$Message.error("配置Ygopro失败");
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
        this.$Message.error("请输入用户名");
        return;
      }
      let roomname = this.datas[index].roomname;
      that.$db.findOne(
        {
          name: ygopro_path
        },
        (err, ret) => {
          if (ret == null) {
            that.joinmodal = true;
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
      that.$db.findOne(
        {
          name: "username"
        },
        (err, ret) => {
          if (ret == null) {
            that.$db.insert(
              {
                name: "username",
                value: that.username
              },
              (err, ret) => {}
            );
          } else {
            that.$db.update(
              {
                name: "username"
              },
              {
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
      this.usertitle = "房间：" + this.datas[index].roomname;
      this.user_datas = [];
      const roommode = this.datas[index].roommode;
      let users = this.datas[index].users;
      if (users.length) {
        for (let i = 0; i < users.length; i++) {
          let user = {};
          let pos = users[i].pos;
          if (roommode == 2) {
            user.pos = pos == 0 || pos == 1 ? "阵营A" : "阵营B";
          } else {
            user.pos = pos == 0 ? "阵营A" : "阵营B";
          }
          let cellClassName = {};
          if (user.pos == "阵营A") {
            cellClassName.pos = "class-table-A";
          } else if (user.pos == "阵营B") {
            cellClassName.pos = "class-table-B";
          }
          user.cellClassName = cellClassName;
          user.username = users[i].name;
          user.usertype = "对战者";
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
      this.$http.get(url).then(function(response) {
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
              room.istart = "等待加入";
              room.sort = 1;
            } else {
              room.sort = 0;
            }
            room.users = rooms[index].users;
            that.datas.push(room);
            that.datas.sort(function(room_a, room_b) {
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
    that.$db.findOne(
      {
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