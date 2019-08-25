<template>
    <div>
        <Table height="520" border :loading="loading" stripe :columns="columns" :data="datas"></Table>
        <div style="margin: 10px;overflow: hidden">
            <div style="float: right;">
                <Page :total="total" :current="current" @on-change="changePage" show-total></Page>
            </div>
        </div>

        <Modal v-model="deckModal" :title="decktitle" :closable="false">
            <div>
                <Tabs value="name1">
                    <TabPane label="怪兽" name="name1">
                        <Table height="300" border :loading="loading" stripe :columns="cardcolumns" :data="monsters"></Table>
                        <div class="number">总数：{{monstersCount}}</div>
                    </TabPane>
                    <TabPane label="魔法" name="name2">
                        <Table height="300" border :loading="loading" stripe :columns="cardcolumns" :data="magics"></Table>
                        <div class="number">总数：{{magicsCount}}</div>
                    </TabPane>
                    <TabPane label="陷阱" name="name3">
                        <Table height="300" border :loading="loading" stripe :columns="cardcolumns" :data="traps"></Table>
                        <div class="number">总数：{{trapsCount}}</div>
                    </TabPane>
                    <TabPane label="额外" name="name4">
                        <Table height="300" border :loading="loading" stripe :columns="cardcolumns" :data="extras"></Table>
                        <div class="number">总数：{{extrasCount}}</div>
                    </TabPane>
                    <TabPane label="副卡组" name="name5">
                        <Table height="300" border :loading="loading" stripe :columns="cardcolumns" :data="sides"></Table>
                        <div class="number">总数：{{sidesCount}}</div>
                    </TabPane>
                </Tabs>
            </div>
            <div slot="footer">
                <Button type="success" @click="downloadDeck">下载卡组</Button>
                <Button type="primary" @click="closeDeckModal">关闭</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import cards from '@/cards/cards';
    import type from '@/cards/deck';
    import cheerio from 'cheerio';
    import fs from 'fs';
    import path from 'path'
    import {
        remote
    } from 'electron';
    const dialog = remote.dialog;

    export default {
        name: 'xpg',
        data() {
            return {
                ret: null,
                decktitle: '',
                decktitles: '',
                deckModal: false,
                loading: true,
                total: 0,
                current: 1,
                baseUrl: "https://ocg.xpg.jp/deck/deck.fcgi",
                decks: [],
                datas: [],
                monsters: [],
                magics: [],
                traps: [],
                extras: [],
                sides: [],
                monstersCount: 0,
                magicsCount: 0,
                trapsCount: 0,
                extrasCount: 0,
                sidesCount: 0,
                dnames: '',
                cardcolumns: [{
                        title: '卡片名称',
                        key: 'name',
                        align: 'center'
                    },
                    {
                        title: '数量',
                        key: 'count',
                        align: 'center'
                    }
                ],
                columns: [{
                        title: '卡组名称',
                        key: 'deckname',
                        width: 150,
                        align: 'center'
                    },
                    {
                        title: '比赛',
                        key: 'match',
                        align: 'center'
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 100,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
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
                                            this.showDeck(params.index)
                                        }
                                    }
                                }, '查看卡组')
                            ]);
                        }
                    }
                ],
            }
        },
        methods: {
            downloadDeck() {
                let ydk = "#created by mius\n#main\n";
                this.monsters.forEach(element => {
                    if (element.num) {
                        for (let i = 0; i < element.count; i++) {
                            ydk = ydk + element.num + "\n";
                        }
                    }
                });
                this.magics.forEach(element => {
                    if (element.num) {
                        for (let i = 0; i < element.count; i++) {
                            ydk = ydk + element.num + "\n";
                        }
                    }
                });
                this.traps.forEach(element => {
                    if (element.num) {
                        for (let i = 0; i < element.count; i++) {
                            ydk = ydk + element.num + "\n";
                        }
                    }
                });
                ydk = ydk + "#extra\n"
                this.extras.forEach(element => {
                    if (element.num) {
                        for (let i = 0; i < element.count; i++) {
                            ydk = ydk + element.num + "\n";
                        }
                    }
                });
                ydk = ydk + "!side\n"
                this.sides.forEach(element => {
                    if (element.num) {
                        for (let i = 0; i < element.count; i++) {
                            ydk = ydk + element.num + "\n";
                        }
                    }
                });
                if (this.ret) {
                    let that = this;
                    dialog.showSaveDialog({
                            title: "保存卡组",
                            defaultPath: path.join(that.ret.dir, '/deck'),
                            filters: [{
                                name: 'ydk',
                                extensions: ['ydk']
                            }]
                        },
                        function (file) {
                            if (file) {
                                console.log(file)
                                fs.writeFile(file, ydk, function (err) {
                                    if (err) {
                                        that.$Message.error('保存卡组失败');
                                    }else{
                                        that.$Message.success('保存卡组成功');
                                    }
                                });
                            }
                        })
                } else {
                    that.$Message.error('没有配置Ygo');
                }
            },
            closeDeckModal() {
                this.deckModal = false;
            },
            showDeck(index) {
                let that = this;
                this.monsters = [];
                this.magics = [];
                this.traps = [];
                this.extras = [];
                this.sides = [];
                this.monstersCount = 0;
                this.magicsCount = 0;
                this.trapsCount = 0;
                this.extrasCount = 0;
                this.sidesCount = 0;
                let url = this.baseUrl + this.datas[index].url
                this.$http.get(url).then(function (response) {
                    if (response.status == 200) {
                        let $ = cheerio.load(response.data);
                        let tr = $(".w15 tbody")[0]["children"].slice(1);
                        let count = 0;
                        let monster = -1;
                        let magic = -1;
                        let trap = -1;
                        let extra = -1;
                        let side = -1;
                        tr.forEach(element => {
                            let data = element["children"][0]["children"][0]["data"];
                            if (data.indexOf("モンスター") != -1) {
                                monster = count;
                            }
                            if (data.indexOf("魔法") != -1) {
                                magic = count;
                            }
                            if (data.indexOf("罠") != -1) {
                                trap = count;
                            }
                            if (data.indexOf("エクストラデッキ") != -1) {
                                extra = count;
                            }
                            if (data.indexOf("サイドデッキ") != -1) {
                                side = count;
                            }
                            count++
                        });
                        if (monster != -1) {
                            if (magic == -1 && trap != -1) {
                                magic = trap;
                            }
                            let o = 0;
                            if (magic == -1) {
                                if (trap != -1) {
                                    o = trap
                                } else if (extra != -1) {
                                    o = extra
                                } else if (side != -1) {
                                    o = side
                                }
                            } else {
                                o = magic
                            }
                            for (let i = monster + 1; i < o; i++) {
                                let element = tr[i];
                                let cardCount = element["children"][0]["children"][0]["data"];
                                let cardName = element["children"][2]["children"][0]["children"][0][
                                    "data"
                                ]
                                let card = {};
                                card.count = cardCount;
                                card.type = "monster";
                                card.name = cardName;
                                let info = cards[cardName];
                                if (info) {
                                    card.num = info[1];
                                    card.name = info[0];
                                }
                                that.monstersCount += parseInt(cardCount)
                                that.monsters.push(card);
                            }
                        }
                        if (magic != -1) {
                            let o = 0;
                            if (trap == -1) {
                                if (extra != -1) {
                                    o = extra
                                } else if (side != -1) {
                                    o = side
                                }
                            } else {
                                o = trap
                            }
                            for (let i = magic + 1; i < o; i++) {
                                let element = tr[i];
                                let cardCount = element["children"][0]["children"][0]["data"];
                                let cardName = element["children"][2]["children"][0]["children"][0][
                                    "data"
                                ]
                                let card = {};
                                card.count = cardCount;
                                card.type = "magic";
                                card.name = cardName;
                                let info = cards[cardName];
                                if (info) {
                                    card.num = info[1];
                                    card.name = info[0];
                                }
                                that.magicsCount += parseInt(cardCount)
                                that.magics.push(card);
                            }
                        }
                        if (trap != -1) {
                            let o = 0;
                            if (extra == -1) {
                                if (side != -1) {
                                    o = side
                                }
                            } else {
                                o = extra
                            }
                            for (let i = trap + 1; i < o; i++) {
                                let element = tr[i];
                                let cardCount = element["children"][0]["children"][0]["data"];
                                let cardName = element["children"][2]["children"][0]["children"][0][
                                    "data"
                                ]
                                let card = {};
                                card.count = cardCount;
                                card.type = "trap";
                                card.name = cardName;
                                let info = cards[cardName];
                                if (info) {
                                    card.num = info[1]
                                    card.name = info[0]
                                }
                                that.trapsCount += parseInt(cardCount)
                                that.traps.push(card);
                            }
                        }
                        if (extra != -1) {
                            let o = 0;
                            if (side == -1) {
                                o = tr.length
                            } else {
                                o = side
                            }
                            for (let i = extra + 1; i < o; i++) {
                                let element = tr[i];
                                let cardCount = element["children"][0]["children"][0]["data"];
                                let cardName = element["children"][2]["children"][0]["children"][0][
                                    "data"
                                ]
                                if (cardName == undefined) {
                                    cardName = element["children"][2]["children"][0]["children"][1][
                                        "data"
                                    ]
                                }
                                let card = {};
                                card.count = cardCount;
                                card.type = "extra";
                                card.name = cardName;
                                let info = cards[cardName]
                                if (info) {
                                    card.num = info[1]
                                    card.name = info[0]
                                }
                                that.extrasCount += parseInt(cardCount)
                                that.extras.push(card);
                            }
                        }
                        if (side != -1) {
                            for (let i = side + 1; i < tr.length; i++) {
                                let element = tr[i];
                                let cardCount = element["children"][0]["children"][0]["data"];
                                let cardName = element["children"][2]["children"][0]["children"][0][
                                    "data"
                                ]
                                if (cardName == undefined) {
                                    cardName = element["children"][2]["children"][0]["children"][1][
                                        "data"
                                    ]
                                }
                                let card = {};
                                card.count = cardCount;
                                card.type = "side";
                                card.name = cardName;
                                let info = cards[cardName]
                                if (info) {
                                    card.num = info[1]
                                    card.name = info[0]
                                }
                                that.sidesCount += parseInt(cardCount)
                                that.sides.push(card);
                            }
                        }
                    }
                    that.decktitle = that.decks[index].deckname + "[" + (that.monstersCount + that.magicsCount +
                            that.trapsCount) + "/" + that.extrasCount + "/" + that.sidesCount + "]" +
                        " - " +
                        that.decks[index].match
                    that.decktitles = that.decks[index].deckname + "-" + that.decks[index].match
                    that.deckModal = true
                })
            },
            getDeck() {
                let that = this;
                let url = this.baseUrl + "?Flt=1&p=1"
                this.$http.get(url).then(function (response) {
                    if (response.status == 200) {
                        that.decks = [];
                        let $ = cheerio.load(response.data);
                        let tbody = $(".w24 tbody");
                        let deckList = tbody.find('tr');
                        for (let i = 2; i < deckList.length; i++) {
                            let tr = deckList[i];
                            let match = tr["children"][0]["children"][0]
                            let deckname = tr["children"][4]["children"][0]["children"][0]["data"]
                            for (let key in type) {
                                deckname = deckname.replace(key, type[key]);
                            }
                            let deck = {};
                            deck.url = match["attribs"]["href"];
                            deck.match = match["children"][0]["data"];
                            deck.deckname = deckname;
                            that.decks.push(deck);
                        }
                        that.total = that.decks.length;
                        that.datas = that.decks.slice(0, 10)
                        that.getData(that.current)
                        that.loading = false;
                    }
                })
            },
            getData(page) {
                this.datas = this.decks.slice((page - 1) * 10, page * 10)
            },
            changePage(page) {
                this.current = page;
                this.getData(page)
            }
        },
        components: {

        },
        created() {
            let that = this;
            that.getDeck();
            that.$db.findOne({
                name: 'ygopro_path_7210'
            }, (err, ret) => {
                if (ret != null) {
                    that.ret = ret;
                }
            })
        },
        beforeDestroy() {},
    }
</script>

<style>
    .number {
        float: right;
        padding-right: 10px;
        padding-top: 10px;
    }
</style>