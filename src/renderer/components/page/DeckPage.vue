<template>
  <div>
    <Row>
      <Table height="550" stripe :columns="columns" :data="datas"></Table>
    </Row>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <Page :total="total" :current="current" @on-change="changePage" show-total></Page>
      </div>
    </div>

    <Modal v-model="update_deckname" title="修改卡组名称" width="300" :closable="false" @on-ok="change_deckname">
      <label class="labelinfo" for="deckname"> 卡组名称:
        <Input v-model="deckname" placeholder="请输入卡组名称" style="width: 200px" id="deckname"></Input>
      </label>
    </Modal>
    <Modal v-model="check_delete" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>确认删除</span>
      </p>
      <div style="text-align:center">
        <p>卡组删除之后无法恢复</p>
        <p>是否确认删除</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long @click="delete_deck">确认删除</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import fs from 'fs';
  import path from 'path'

  export default {
    name: 'deck',
    data() {
      return {
        check_delete: false,
        update_deckname: false,
        deckname: '',
        columns: [{
          title: '卡组名称',
          key: 'deckname',
        }, {
          title: '操作',
          key: 'action',
          width: 250,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.change_deck(params.row)
                  }
                }
              }, '修改名称'),
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.update_deck(params.row)
                  }
                }
              }, '编辑卡组'),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.del_deck(params.row)
                  }
                }
              }, '删除卡组')
            ]);
          }
        }],
        datas: [],
        data: [],
        timer: null,
        total: 10,
        current: 1,
        ret: null,
        row: null
      }
    },
    methods: {
      update_deck(row) {
        this.$ygo.updateDeck(this.ret.dir,this.ret.path, row.deckname)
      },
      change_deckname() {
        let that = this;
        let oldname = this.row.deckname_stuff;
        let newname = this.deckname + '.ydk';
        if (oldname == newname) {
          return
        } else {
          fs.rename(path.join(that.ret.dir, '/deck', oldname), path.join(that.ret.dir, '/deck', newname), function (err) {
            if (err) {
              that.$Message.error('修改卡组名称失败');
              console.log(err);
              return
            }
            that.$Message.success('修改卡组名称成功');
            that.showData();
          });
        }
      },
      change_deck(row) {
        this.deckname = row.deckname
        this.row = row;
        this.update_deckname = true;
      },
      delete_deck() {
        let that = this;
        let row = this.row;
        let deckname = path.join(that.ret.dir, '/deck', row.deckname_stuff)
        fs.unlink(deckname, function (err) {
          if (err) {
            that.$Message.error('删除卡组失败');
            console.log(err);
            return
          }
          that.$Message.success('删除卡组成功');
          that.showData();
        });
        this.check_delete = false;
      },
      del_deck(row) {
        this.row = row;
        this.check_delete = true;
      },
      showData() {
        let that = this;
        that.data = [];
        let deckdir = path.join(that.ret.dir, '/deck');
        fs.readdir(deckdir, function (err, files) {
          if (err) {
            console.log(err);
            return;
          }
          for (let i = 0; i < files.length; i++) {
            let stuff = path.extname(files[i]);
            if (stuff == '.ydk') {
              let dot = files[i].lastIndexOf('.');
              if ((dot > -1) && (dot < (files[i].length))) {
                let deck = {};
                deck.deckname = files[i].substring(0, dot);
                deck.deckname_stuff = files[i];
                that.data.push(deck);
              }
            }
          }
          that.total = that.data.length;
          that.datas = that.data.slice(0, 10)
          that.getData(that.current)
        })
      },
      getData(page) {
        this.datas = this.data.slice((page - 1) * 10, page * 10)
      },
      changePage(page) {
        this.current = page;
        this.showData()
      }
    },
    components: {

    },
    created() {
      let that = this;
      that.$db.findOne({
        name: 'ygopro_path_7210'
      }, (err, ret) => {
        if (ret != null) {
          that.ret = ret;
          that.showData();
          that.timer = setInterval(this.showData, 3000);
        }
      })
    },
    beforeDestroy() {
      if (this.timer) {
        clearInterval(this.timer);
      }
    },
  }
</script>

<style>
  
</style>