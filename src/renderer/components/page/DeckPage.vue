<template>
  <div>
    <Row>
      <Table height="550" stripe :columns="columns" :data="datas"></Table>
    </Row>

    <Modal v-model="update_deckname" :title="$t('deck.updateTitle')" width="350" :closable="false" @on-ok="change_deckname" :ok-text="$t('deck.ok')" :cancel-text="$t('deck.cancel')">
      <label class="labelinfo" for="deckname"> {{$t('deck.deckname')}}:
        <Input v-model="deckname" :placeholder="$t('placeholder.deckname')" style="width: 200px" id="deckname"></Input>
      </label>
    </Modal>
    <Modal v-model="check_delete" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>{{$t('deck.deleteCheck')}}</span>
      </p>
      <div style="text-align:center">
        <p>{{$t('deck.deleteMsg_1')}}</p>
        <p>{{$t('deck.deleteMsg_2')}}</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long @click="delete_deck">{{$t('deck.deleteCheck')}}</Button>
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
          title: this.$t('deck.deckname'),
          key: 'deckname',
        }, {
          title: this.$t('deck.operate'),
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
              }, this.$t('deck.update')),
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
              }, this.$t('deck.edit')),
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
              }, this.$t('deck.delete'))
            ]);
          }
        }],
        datas: [],
        data: [],
        timer: null,
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
              that.$Message.error(that.$t('deck.updateError'));
              console.log(err);
              return
            }
            that.$Message.success(that.$t('deck.updateSuccess'));
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
            that.$Message.error(that.$t('deck.deleteError'));
            console.log(err);
            return
          }
          that.$Message.success(that.$t('deck.deleteSuccess'));
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
          that.datas = that.data
        })
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