<template>
    <div class="title-bar">
        <div class="logo">
            <img class="no-drag closes" src="@/assets/logo.png" height="30px" alt="mius" />
        </div>
        <div class="search">
            <Row>
                <img :src="closeurl" height="20px" @click="close('close')" class="no-drag closes" @mouseover="closeOver"
                    @mouseout="closeOut" />
                <img :src="getMaxed()" height="20px" @click="close('max')" class="no-drag closes" @mouseover="maxOver"
                    @mouseout="maxOut" />
                <img :src="minurl" height="20px" @click="close('min')" class="no-drag closes" @mouseover="minOver"
                    @mouseout="minOut" />
                <img @click="sideShow = true" class="no-drag closes" :src="setUrl" height="20px" alt="mius"
                    @mouseover="setOver" @mouseout="setOut" />
            </Row>
        </div>

        <Drawer placement="left" :closable="false" v-model="sideShow">
            <Divider>{{$t('app.setting')}}</Divider>
            <div class="appSetting">
                <Form>
                    <FormItem :label="$t('app.language')">
                        <Dropdown trigger="click" @on-click="changeLanguages">
                            <a href="javascript:void(0)">
                                {{lang}}
                                <Icon type="ios-arrow-down"></Icon>
                            </a>
                            <DropdownMenu slot="list">
                                <DropdownItem name="zh">中文</DropdownItem>
                                <DropdownItem name="en">English</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </FormItem>
                </Form>
            </div>
            <div class="appAbout">
                <Divider>{{$t('app.about')}}</Divider>
                <Form>
                    <FormItem>
                        <span class="updateSpan"><a href="javascript:void(0)"
                                @click="test">{{$t('app.updateLog')}}</a></span>
                    </FormItem>
                </Form>
            </div>
        </Drawer>
    </div>
</template>
<script>
    import closeSrc from '@/assets/close.png';
    import closeinSrc from '@/assets/close-in.png';
    import maxSrc from '@/assets/max.png';
    import maxinSrc from '@/assets/max-in.png';
    import minSrc from '@/assets/min.png';
    import mininSrc from '@/assets/min-in.png';
    import unmaxSrc from '@/assets/unmax.png';
    import unmaxinSrc from '@/assets/unmax-in.png';
    import {
        ipcRenderer as ipc
    } from 'electron';
    import {
        shell
    } from 'electron';
    import setScr from '@/assets/set.png';
    import setinSrc from '@/assets/set-in.png';

    export default {
        name: 'TitleBar',
        data() {
            return {
                value: '',
                closeurl: closeSrc,
                maxurl: maxSrc,
                minurl: minSrc,
                unmaxurl: unmaxSrc,
                ismax: false,
                lang: '中文',
                isCn: true,
                sideShow: false,
                setUrl: setScr
            }
        },
        methods: {
            close(clicktype) {
                console.log(minSrc)
                ipc.send(clicktype);
            },
            closeOver() {
                this.closeurl = closeinSrc;
            },
            closeOut() {
                this.closeurl = closeSrc;
            },
            maxOver() {
                this.maxurl = maxinSrc;
                this.unmaxurl = unmaxinSrc
            },
            maxOut() {
                this.maxurl = maxSrc;
                this.unmaxurl = unmaxSrc
            },
            minOver() {
                this.minurl = mininSrc;
            },
            minOut() {
                this.minurl = minSrc;
            },
            setOver() {
                this.setUrl = setinSrc;
            },
            setOut() {
                this.setUrl = setScr;
            },
            getMaxed() {
                if (this.ismax) {
                    return this.unmaxurl;
                }
                return this.maxurl
            },
            test() {
                shell.openExternal("https://mius.pro/#/changelog")
            },
            changeLanguages(key) {
                const lang = localStorage.getItem('lang_setting') ? localStorage.getItem('lang_setting') : 'zh'
                if ('zh' === key) {
                    this.lang = '中文'
                } else if ('en' === key) {
                    this.lang = 'English'
                }
                this.$i18n.locale = key
                localStorage.setItem('lang_setting', key)
                if (key != lang) {
                    this.$router.replace({
                        name: 'load'
                    });
                }
            },
        },
        created() {
            let lang = localStorage.getItem('lang_setting') ? localStorage.getItem('lang_setting') : 'zh'
            if ('zh' === lang) {
                this.lang = '中文'
                this.isCn = true
            } else if ('en' === lang) {
                this.lang = 'English'
                this.isCn = false
            }
            if (localStorage.getItem('first') === 'true') {
                this.sideShow = true
                localStorage.setItem('first', 'false')
            }
        },
        mounted() {
            const that = this;
            ipc.on('maximize', (event, message) => {
                this.ismax = true
            })
            ipc.on('unmaximize', (event, message) => {
                this.ismax = false
            })
        }
    };
</script>

<style>
    .title-bar {
        width: 100%;
        height: 55px;
        background-color: #324157;
        transition: width 0.3s ease;
        -webkit-app-region: drag;
    }

    .logo {
        color: #ffffff;
        font-size: 18px;
        padding-top: 12px;
        padding-left: 20px;
        width: 200;
        position: fixed;
        left: 0;
    }

    .search {
        padding-top: 15px;
        margin-left: 200px;
    }

    .closes {
        float: right;
        padding-right: 10px;
    }

    .no-drag {
        -webkit-app-region: no-drag;
    }

    .appSetting .ivu-form-item-label {
        font-size: 15px;
        padding-left: 15px;
    }

    .appSetting a {
        font-size: 15px;
    }

    .appSetting .ivu-dropdown-item {
        font-size: 15px !important;
    }

    .appAbout .updateSpan {
        font-size: 15px;
        padding: 15px;
    }

    .appAbout .updateSpan a {
        color: #515a6e;
    }

    .appAbout .updateSpan a:hover {
        color: #2d8cf0;
    }
</style>