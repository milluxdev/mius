<template>
  <div class="page">
    <div v-show="mc_show">
      <Row>
        <div>
          <div style="padding-bottom: 5px; padding-top: 5px; padding-right: 5px;">
            <div style="float: left;padding-left: 10px; padding-right: 50px;">
              使用卡组
              <Select v-model="sel_deck" style="width:120px" placeholder="请选择卡组">
                <Option
                  v-for="item in deckList"
                  :value="item.value"
                  :key="item.value"
                >{{ item.label }}</Option>
              </Select>
              <Button
                type="info"
                @click="match('athletic')"
                :loading="athletics_loading"
                v-show="athletics_show"
              >
                <Icon :type="athletics_icon"></Icon>
                <font size="2.2">{{athletics_text}}</font>
              </Button>
              <Button @click="match('entertain')" v-show="entert_show">
                <font size="2">娱乐匹配</font>
              </Button>
              <Button @click="cancel" v-show="cancel_show">
                <font size="2">取消匹配</font>
              </Button>
              <Button @click="showCreatRoom">
                <font size="2">创建房间</font>
              </Button>
            </div>
            <div style="float: right;">
              <Avatar
                shape="square"
                :src="mcuser!=null?mcuser.user.avatar:defavatar"
                icon="ios-person"
              />
              <Tag
                color="default"
                style="margin-right: -1px;"
              >{{mcuser!=null?mcuser.user.username:''}}</Tag>
              <Tag color="primary" style="margin-right: -1px;" @click.native="setting">设置</Tag>
              <Tag color="error" style="margin-right: -1px;" @click.native="mcloginout">登出</Tag>
            </div>
          </div>
        </div>
      </Row>
      <Row>
        <Tabs value="arena" @on-click="tabs_on_click">
          <TabPane label="竞技场积分" name="arena">
            <Table height="280" stripe :columns="columns1" :data="data1" :loading="data_loading"></Table>
          </TabPane>
          <TabPane label="竞技场决斗记录" name="arena_history">
            <Table
              height="280"
              stripe
              :columns="history_columns"
              :data="history_data"
              :loading="history_data_loading"
            ></Table>
          </TabPane>
          <TabPane label="等待游戏" name="wait">
            <Row>
              <Table
                height="280"
                stripe
                :columns="wait_columns"
                :data="rooms"
                no-data-text="现在没有等待中的游戏"
              ></Table>
            </Row>
          </TabPane>
          <TabPane label="观战列表" name="replay">
            <Row>
              <Table height="280" stripe :columns="replay_columns" :data="replay_rooms"></Table>
            </Row>
          </TabPane>
        </Tabs>
      </Row>
      <Modal v-model="usermodal" :title="usertitle" :styles="{top: '150px'}">
        <div style="text-align:center">
          <Table height="240" :columns="user_columns" :data="user_datas"></Table>
        </div>
        <div slot="footer">
          <Button type="info" size="large" long @click="closeUserModal">关闭</Button>
        </div>
      </Modal>
      <Modal v-model="creatmodal" title="创建房间">
        <div style="text-align:center">
          <Form :model="room" label-position="right" :label-width="80">
            <Row>
              <Col span="11">
                <FormItem label="房间名称">
                  <Input v-model="room.title"></Input>
                </FormItem>
              </Col>
              <Col span="11">
                <FormItem label="决斗模式">
                  <Select v-model="room.options.mode">
                    <Option
                      v-for="item in modeList"
                      :value="item.value"
                      :key="item.value"
                    >{{ item.label }}</Option>
                  </Select>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="11">
                <FormItem label="卡片允许">
                  <Select v-model="room.options.rule">
                    <Option
                      v-for="item in ruleList"
                      :value="item.value"
                      :key="item.value"
                    >{{ item.label }}</Option>
                  </Select>
                </FormItem>
              </Col>
            </Row>
            <Divider>额外选项</Divider>
            <Row>
              <Col span="8">
                <FormItem label="初始 LP">
                  <Input type="number" v-model="room.options.start_lp"></Input>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="初始手牌数">
                  <Input type="number" v-model="room.options.start_hand"></Input>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="每回合抽卡">
                  <Input type="number" v-model="room.options.draw_count"></Input>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="8">
                <Checkbox v-model="room.options.enable_priority">旧规则</Checkbox>
              </Col>
              <Col span="8">
                <Checkbox v-model="room.options.no_check_deck">不检查卡组</Checkbox>
              </Col>
              <Col span="8">
                <Checkbox v-model="room.options.no_shuffle_deck">不洗切卡组</Checkbox>
              </Col>
            </Row>
          </Form>
        </div>
        <div slot="footer">
          <Button type="info" size="large" long @click="creatRoom">创建房间</Button>
        </div>
      </Modal>
      <Modal v-model="settings" title="配置" width="300" :closable="false">
        <Button @click="setok">配置YGOPro</Button>
        <div slot="footer">
          <Button type="info" @click="setting_close">关闭</Button>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
import querystring from "querystring";
import { remote } from "electron";
import fs from "fs";
import path from "path";
const dialog = remote.dialog;
export default {
  name: "McServer",

  data() {
    return {
      history_data_loading: true,
      data_loading: true,
      settings: false,
      modeList: [
        {
          value: 0,
          label: "单局模式"
        },
        {
          value: 1,
          label: "比赛模式"
        },
        {
          value: 2,
          label: "TAG"
        }
      ],
      ruleList: [
        {
          value: 0,
          label: "OCG"
        },
        {
          value: 1,
          label: "TCG"
        },
        {
          value: 2,
          label: "OCG & TCG"
        },
        {
          value: 3,
          label: "专有卡禁止"
        }
      ],
      room: {
        title: "",
        options: {
          rule: 0,
          start_lp: 8000,
          mode: 0,
          start_hand: 5,
          draw_count: 1,
          enable_priority: false,
          no_check_deck: false,
          no_shuffle_deck: false
        }
      },
      creatmodal: false,
      usermodal: false,
      usertitle: "",
      user_columns: [
        {
          title: "玩家阵营",
          key: "position"
        },
        {
          title: "玩家名称",
          key: "username"
        }
      ],
      user_datas: [],
      collapsevalue: "1",
      mc_show: false,
      ret: null,
      source: null,
      athletics_show: true,
      entert_show: true,
      cancel_show: false,
      athletics_icon: "play",
      athletics_text: "竞技匹配",
      athletics_loading: false,
      entert_loading: false,
      deckList: [],
      sel_deck: "",
      mcuser: null,
      defavatar: "https://cdn01.moecube.com/accounts/default_avatar.jpg",
      replay_columns: [
        {
          title: "游戏模式",
          key: "mode",
          align: "center",
          width: 100,
          filters: [
            {
              label: "单人模式",
              value: 1
            },
            {
              label: "竞技匹配",
              value: 2
            },
            {
              label: "娱乐匹配",
              value: 3
            },
            {
              label: "单局模式",
              value: 4
            },
            {
              label: "比赛模式",
              value: 5
            },
            {
              label: "TAG",
              value: 6
            }
          ],
          filterMultiple: false,
          filterMethod(value, room) {
            switch (value) {
              case 1:
                return room.id.startsWith("AI#");
              case 2:
                return room.arena === "athletic";
              case 3:
                return room.arena === "entertain";
              case 4:
                return (
                  !(room.arena || room.id.startsWith("AI#")) &&
                  room.options.mode === 0
                );
              case 5:
                return (
                  !(room.arena || room.id.startsWith("AI#")) &&
                  room.options.mode === 1
                );
              case 6:
                return (
                  !(room.arena || room.id.startsWith("AI#")) &&
                  room.options.mode === 2
                );
            }
          },
          render: (h, params) => {
            let str = "";
            let room = params.row;
            if (room.id.startsWith("AI#")) {
              str = "单人模式";
            } else if (room.arena === "athletic") {
              str = "竞技匹配";
            } else if (room.arena === "entertain") {
              str = "娱乐匹配";
            } else if (
              !(room.arena || room.id.startsWith("AI#")) &&
              room.options.mode === 0
            ) {
              str = "单局模式";
            } else if (
              !(room.arena || room.id.startsWith("AI#")) &&
              room.options.mode === 1
            ) {
              str = "比赛模式";
            } else if (
              !(room.arena || room.id.startsWith("AI#")) &&
              room.options.mode === 2
            ) {
              str = "TAG";
            }
            return h("div", [h("div", str)]);
          }
        },
        {
          title: "房间名称",
          key: "title",
          align: "center",
          render: (h, params) => {
            let str = "";
            let room = params.row;
            let user_a = room.users[0];
            let user_b = room.users[1];
            if (room.private) {
              str = user_a.username + "的私密房间";
            } else if (room.arena || room.id.startsWith("AI#")) {
              str = user_a.username + " 跟 " + user_b.username + " 的决斗";
            } else if (
              !(room.arena || room.id.startsWith("AI#") || room.private)
            ) {
              str = room.title;
            }
            return h("div", [h("div", str)]);
          }
        },
        {
          title: "玩家",
          key: "user",
          width: 100,
          align: "center",
          render: (h, params) => {
            let room = params.row;
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
                      this.showUserModal(room);
                    }
                  }
                },
                "查看玩家"
              )
            ]);
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
                      this.join_room(params.row);
                    }
                  }
                },
                "观看比赛"
              )
            ]);
          }
        }
      ],
      wait_columns: [
        {
          title: "游戏模式",
          key: "mode",
          align: "center",
          width: 100,
          filters: [
            {
              label: "单局模式",
              value: 0
            },
            {
              label: "比赛模式",
              value: 1
            },
            {
              label: "TAG",
              value: 2
            }
          ],
          filterMultiple: false,
          filterMethod(value, room) {
            return room.options.mode == value;
          },
          render: (h, params) => {
            let str = "";
            switch (params.row.options.mode) {
              case 0:
                str = "单局模式";
                break;
              case 1:
                str = "比赛模式";
                break;
              case 2:
                str = "TAG";
                break;
            }
            return h("div", [h("div", str)]);
          }
        },
        {
          title: "房间名称",
          key: "title",
          align: "center"
        },
        {
          title: "玩家",
          key: "user",
          width: 90,
          align: "center",
          render: (h, params) => {
            let room = params.row;
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
                      this.showUserModal(room);
                    }
                  }
                },
                "查看玩家"
              )
            ]);
          }
        },
        {
          title: "初始LP",
          key: "start_lp",
          width: 100,
          align: "center",
          render: (h, params) => {
            return h("div", [h("div", params.row.options.start_lp)]);
          }
        },
        {
          title: "初始手牌数",
          key: "start_hand",
          width: 100,
          align: "center",
          render: (h, params) => {
            return h("div", [h("div", params.row.options.start_hand)]);
          }
        },
        {
          title: "每回合抽卡",
          key: "draw_count",
          width: 100,
          align: "center",
          render: (h, params) => {
            return h("div", [h("div", params.row.options.draw_count)]);
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
                      this.join_room(params.row);
                    }
                  }
                },
                "加入房间"
              )
            ]);
          }
        }
      ],
      history_columns: [
        {
          title: "获胜方",
          key: "usernamea",
          render: (h, params) => {
            return h(
              "Tag",
              {
                props: {
                  color: "success"
                }
              },
              params.row.winner
            );
          }
        },
        {
          title: "失败方",
          key: "usernameb",
          render: (h, params) => {
            let user = params.row.usernamea;
            if (params.row.winner == user) {
              user = params.row.usernameb;
            }
            return h(
              "Tag",
              {
                props: {
                  color: "error"
                }
              },
              user
            );
          }
        },
        {
          title: "开始时间",
          align: "center",
          key: "start_time",
          width: 150,
          render: (h, params) => {
            let str = this.$moment(new Date(params.row.start_time)).format(
              "YYYY-MM-DD HH:mm:ss"
            );
            return h("div", [h("div", str)]);
          }
        },
        {
          title: "结束时间",
          align: "center",
          key: "end_time",
          width: 150,
          render: (h, params) => {
            let str = this.$moment(new Date(params.row.end_time)).format(
              "YYYY-MM-DD HH:mm:ss"
            );
            return h("div", [h("div", str)]);
          }
        }
      ],
      columns1: [
        {
          title: "D.P",
          key: "pt"
        },
        {
          title: "排名",
          key: "arena_rank"
        },
        {
          title: "胜场",
          key: "athletic_win"
        },
        {
          title: "负场",
          key: "athletic_lose"
        },
        {
          title: "平局",
          key: "athletic_draw"
        },
        {
          title: "总场",
          key: "athletic_all"
        },
        {
          title: "胜率",
          key: "athletic_wl_ratio"
        }
      ],
      data1: [],
      history_data: [],
      servers: [
        {
          id: "tiramisu",
          url: "wss://tiramisu.mycard.moe:7923",
          address: "tiramisu.mycard.moe",
          port: 7911,
          custom: true,
          replay: true
        },
        {
          id: "tiramisu-athletic",
          url: "wss://tiramisu.mycard.moe:8923",
          address: "tiramisu.mycard.moe",
          port: 8911,
          custom: false,
          replay: true
        }
      ],
      us_servers: [
        {
          id: "mercury-us-1-athletic",
          url: "wss://mercury-us-1.mycard.moe:7923",
          address: "mercury-us-1.mycard.moe",
          port: 7911,
          custom: true,
          replay: true
        },
        {
          id: "mercury-us-1",
          url: "wss://mercury-us-1.mycard.moe:7923",
          address: "mercury-us-1.mycard.moe",
          port: 8911,
          custom: false,
          replay: true
        }
      ],
      rooms_loading: true,
      rooms: [],
      connections: [],
      replay_connections: [],
      replay_rooms: []
    };
  },
  components: {},
  methods: {
    setting() {
      this.settings = true;
    },
    setting_close() {
      this.settings = false;
    },
    setok() {
      let that = this;
      let ygopro_path = "ygopro_path_mc";
      dialog.showOpenDialog(
        {
          title: "配置YGOPro",
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
                        that.$Message.success("配置YGOPro成功");
                      } else {
                        that.$Message.error("配置YGOPro失败");
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
                        that.$Message.success("配置YGOPro成功");
                      } else {
                        that.$Message.error("配置YGOPro失败");
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
    showCreatRoom() {
      console.log(this.replay_rooms);
      this.room = {
        title: "",
        options: {
          rule: 0,
          start_lp: 8000,
          mode: 0,
          start_hand: 5,
          draw_count: 1,
          enable_priority: false,
          no_check_deck: false,
          no_shuffle_deck: false
        }
      };
      this.creatmodal = true;
      this.updateDeck();
    },
    creatRoom() {
      let room = this.room;
      if (room.title.trim() == "") {
        this.$Message.error("房间名不能为空");
        return;
      }
      if (this.sel_deck == "") {
        this.$Message.error("卡组不能为空");
        return;
      }
      let options_buffer = new Buffer(6);
      options_buffer.writeUInt8(1 << 4, 1);
      options_buffer.writeUInt8(
        (room.options.rule << 5) |
          (room.options.mode << 3) |
          (room.options.enable_priority ? 1 << 2 : 0) |
          (room.options.no_check_deck ? 1 << 1 : 0) |
          (room.options.no_shuffle_deck ? 1 : 0),
        2
      );
      options_buffer.writeUInt16LE(room.options.start_lp, 3);
      options_buffer.writeUInt8(
        (room.options.start_hand << 4) | room.options.draw_count,
        5
      );
      let checksum = 0;
      for (let i = 1; i < options_buffer.length; i++) {
        checksum -= options_buffer.readUInt8(i);
      }
      options_buffer.writeUInt8(checksum & 0xff, 0);
      let secret = (this.mcuser.user.id % 65535) + 1;
      for (let i = 0; i < options_buffer.length; i += 2) {
        options_buffer.writeUInt16LE(
          options_buffer.readUInt16LE(i) ^ secret,
          i
        );
      }

      let password =
        options_buffer.toString("base64") +
        room.title.replace(/\s/, String.fromCharCode(0xfeff));
      this.join(password, this.servers[0]);
      this.creatmodal = false;
    },
    async join(name, server) {
      let ip = server.address;
      let port = server.port.toString();
      let roomname = name;
      let username = this.mcuser.user.username;
      let deckname = this.sel_deck;
      this.$ygo.joinGame(
        this.ret.dir,
        this.ret.path,
        ip,
        port,
        username,
        roomname,
        deckname
      );
    },
    join_room(room) {
      let options_buffer = new Buffer(6);
      options_buffer.writeUInt8(3 << 4, 1);
      let checksum = 0;
      for (let i = 1; i < options_buffer.length; i++) {
        checksum -= options_buffer.readUInt8(i);
      }
      options_buffer.writeUInt8(checksum & 0xff, 0);

      let secret = (this.mcuser.user.id % 65535) + 1;
      for (let i = 0; i < options_buffer.length; i += 2) {
        options_buffer.writeUInt16LE(
          options_buffer.readUInt16LE(i) ^ secret,
          i
        );
      }

      let name = options_buffer.toString("base64") + room.id;

      this.join(name, room.server);
      this.updateDeck();
    },
    closeUserModal() {
      this.usermodal = false;
    },
    showUserModal(room) {
      this.usertitle = "";
      let user_a = room.users[0];
      let user_b = room.users[1];
      if (room.private) {
        this.usertitle = "房间：" + user_a.username + "的私密房间";
      } else if (room.arena || room.id.startsWith("AI#")) {
        this.usertitle =
          "房间：" + user_a.username + " 跟 " + user_b.username + " 的决斗";
      } else if (!(room.arena || room.id.startsWith("AI#") || room.private)) {
        this.usertitle = "房间：" + room.title;
      }
      for (let user of room.users) {
        let pos = user.position;
        if (room.options.mode == 2) {
          user.position = pos == 0 || pos == 1 ? "阵营A" : "阵营B";
        } else {
          user.position = pos == 0 ? "阵营A" : "阵营B";
        }
        let cellClassName = {};
        if (user.position == "阵营A") {
          cellClassName.position = "class-table-A";
        } else if (user.position == "阵营B") {
          cellClassName.position = "class-table-B";
        }
        user.cellClassName = cellClassName;
        if (pos < 4) {
          this.user_datas.push(user);
        }
      }
      this.user_datas = room.users;
      this.usermodal = true;
    },
    cancel() {
      this.source();
    },
    getDecks() {
      let that = this;
      that.deckList = [];
      let deckdir = path.join(that.ret.dir, "/deck");
      fs.readdir(deckdir, function(err, files) {
        if (err) {
          console.log(err);
          return;
        }
        for (let i = 0; i < files.length; i++) {
          let stuff = path.extname(files[i]);
          if (stuff == ".ydk") {
            let dot = files[i].lastIndexOf(".");
            if (dot > -1 && dot < files[i].length) {
              let deck = {};
              deck.value = files[i].substring(0, dot);
              deck.label = files[i].substring(0, dot);
              that.deckList.push(deck);
            }
          }
        }
      });
    },
    match(type) {
      let that = this;
      if (that.ret != null) {
        this.athletics_loading = true;
        this.athletics_icon = "";
        this.entert_show = false;
        this.cancel_show = true;
        if (type == "entertain") {
          this.athletics_text = "娱乐匹配";
        } else if (type == "athletic") {
          this.athletics_text = "竞技匹配";
        }
        let header = {
          Authorization: this.authorization
        };
        let search = {
          arena: type,
          locale: "zh-CN"
        };
        let mcinstance = this.$http.create({
          baseURL: "https://api.mycard.moe/",
          headers: header
        });
        let CancelToken = this.$http.CancelToken;
        mcinstance.defaults.headers.post["Content-Type"] =
          "application/x-www-form-urlencoded";
        mcinstance
          .post(
            "/ygopro/match?" + querystring.stringify(search),
            {},
            {
              cancelToken: new CancelToken(function executor(c) {
                that.source = c;
              })
            }
          )
          .then(function(response) {
            if (response.status == 200) {
              let dataJson = response.data;
              that.entert_show = true;
              that.cancel_show = false;
              that.athletics_loading = false;
              that.athletics_icon = "play";
              that.athletics_text = "竞技匹配";
              that.$ygo.joinGame(
                that.ret.dir,
                that.ret.path,
                dataJson.address,
                dataJson.port,
                that.mcuser.user.username,
                dataJson.password,
                that.sel_deck
              );
            }
          })
          .catch(function(thrown) {
            if (that.$http.isCancel(thrown)) {
              that.entert_show = true;
              that.cancel_show = false;
              that.athletics_loading = false;
              that.athletics_icon = "play";
              that.athletics_text = "竞技匹配";
            } else {
              // handle error
            }
          });
        this.updateDeck();
      } else {
        that.$Message.error("没有配置Ygo");
      }
    },
    mcloginout() {
      let that = this;
      that.$db.remove(
        {
          name: "mcuser"
        },
        (err, ret) => {
          that.$router.replace({
            name: "mclogin"
          });
          that.$Message.success("退出成功");
        }
      );
    },
    getPoint() {
      let that = this;
      let search = {
        username: that.mcuser.user.username
      };
      let mcinstance = that.$http.create({
        baseURL: "https://api.mycard.moe/ygopro/arena/"
      });
      mcinstance
        .get("user?" + querystring.stringify(search))
        .then(function(response) {
          let data = response.data;
          that.data1 = [];
          that.data1.push(data);
          that.data_loading = false;
        });
    },
    getHistory() {
      let that = this;
      let mcinstance = that.$http.create({
        baseURL: "https://api.mycard.moe/ygopro/arena/"
      });
      let history_search = {
        username: that.mcuser.user.username,
        type: 1,
        page_num: 100
      };
      mcinstance
        .get("history?" + querystring.stringify(history_search))
        .then(function(response) {
          let data = response.data.data;
          that.history_data = [];
          that.history_data = data;
          that.history_data_loading = false;
        });
    },
    tabs_on_click(name) {
      if (name == "arena") {
        this.getPoint();
      }
      if (name == "arena_history") {
        this.getHistory();
      }
    },
    connect() {
      let that = this;
      this.connections = this.servers
        .filter(server => server.custom)
        .map(server => {
          let url = new URL(server.url);
          url["searchParams"].set("filter", "waiting");
          let connection = new WebSocket(url.toString());
          connection.onclose = event => {
            that.rooms = that.rooms.filter(room => room.server !== server);
          };
          connection.onerror = event => {
            console.log("error", server.id, event);
            that.rooms = that.rooms.filter(room => room.server !== server);
          };
          connection.onmessage = event => {
            let message = JSON.parse(event.data);
            switch (message.event) {
              case "init":
                that.rooms_loading = false;
                that.rooms = that.rooms
                  .filter(room => room.server !== server)
                  .concat(
                    message.data.map(room =>
                      Object.assign(
                        {
                          server: server
                        },
                        room
                      )
                    )
                  );
                break;
              case "create":
                that.rooms.push(
                  Object.assign(
                    {
                      server: server
                    },
                    message.data
                  )
                );
                break;
              case "update":
                Object.assign(
                  this.rooms.find(
                    room =>
                      room.server === server && room.id === message.data.id
                  ),
                  message.data
                );
                break;
              case "delete":
                that.rooms.splice(
                  this.rooms.findIndex(
                    room => room.server === server && room.id === message.data
                  ),
                  1
                );
            }
          };
          return connection;
        });
      this.replay_connections = this.servers
        .filter(server => server.replay)
        .map(server => {
          let url = new URL(server.url);
          url["searchParams"].set("filter", "started");
          let connection = new WebSocket(url.toString());
          connection.onclose = () => {
            that.replay_rooms = that.replay_rooms.filter(
              room => room.server !== server
            );
          };
          connection.onmessage = event => {
            let message = JSON.parse(event.data);
            switch (message.event) {
              case "init":
                that.replay_rooms = that.replay_rooms
                  .filter(room => room.server !== server)
                  .concat(
                    message.data.map(room =>
                      Object.assign(
                        {
                          server: server,
                          private: /^\d+$/.test(room.title)
                        },
                        room
                      )
                    )
                  );
                break;
              case "create":
                that.replay_rooms.push(
                  Object.assign(
                    {
                      server: server,
                      private: /^\d+$/.test(message.data.title)
                    },
                    message.data
                  )
                );
                break;
              case "delete":
                that.replay_rooms.splice(
                  that.replay_rooms.findIndex(
                    room => room.server === server && room.id === message.data
                  ),
                  1
                );
            }
          };
          return connection;
        });
    },
    closeConnection() {
      for (let connection of this.replay_connections) {
        connection.close();
      }
      for (let connection of this.connections) {
        connection.close();
      }
      this.replay_connections = [];
      this.connections = [];
    },
    updateDeck() {
      let that = this;
      that.$db.findOne(
        {
          name: "mc_deck"
        },
        (err, ret) => {
          if (ret == null) {
            that.$db.insert(
              {
                name: "mc_deck",
                value: that.sel_deck
              },
              (err, ret) => {}
            );
          } else {
            that.$db.update(
              {
                name: "mc_deck"
              },
              {
                $set: {
                  name: "mc_deck",
                  value: that.sel_deck
                }
              },
              (err, ret) => {}
            );
          }
        }
      );
    }
  },
  created() {
    let that = this;
    that.$db.findOne(
      {
        name: "mc_deck"
      },
      (err, ret) => {
        if (ret != null) {
          that.sel_deck = ret.value;
        }
      }
    );
    that.$db.findOne(
      {
        name: "mcuser"
      },
      (err, ret) => {
        if (ret != null) {
          that.mcuser = ret.value;
          that.authorization =
            "Basic " +
            new Buffer(
              ret.value.user.username + ":" + ret.value.user.id
            ).toString("base64");
          that.mc_show = true;
          that.getPoint();
        } else {
          that.$router.replace({
            name: "mclogin"
          });
        }
      }
    );
    that.$db.findOne(
      {
        name: "ygopro_path_mc"
      },
      (err, ret) => {
        if (ret != null) {
          that.ret = ret;
          that.getDecks();
        }
      }
    );
    that.connect();
  },
  beforeDestroy() {
    this.closeConnection();
  }
};
</script>

<style>
</style>