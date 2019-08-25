<template>
    <div class="title-bar">
        <div class="logo">
            <img src="@/assets/logo.png" height="30px" alt="mius" />
        </div>
        <div class="search">
            <Row>
                <img :src="closeurl" height="20px" @click="close('close')" class="no-drag closes" @mouseover="closeOver" @mouseout="closeOut"
                />
                <img :src="getMaxed()" height="20px" @click="close('max')" class="no-drag closes" @mouseover="maxOver" @mouseout="maxOut"
                />
                <img :src="minurl" height="20px" @click="close('min')" class="no-drag closes" @mouseover="minOver" @mouseout="minOut" />
            </Row>
        </div>
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
    import { ipcRenderer as ipc } from 'electron';

    export default  {
        name: 'TitleBar',
        data() {
            return {
                value: '',
                closeurl: closeSrc,
                maxurl: maxSrc,
                minurl: minSrc,
                unmaxurl: unmaxSrc,
                ismax: false
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
            getMaxed() {
                if (this.ismax) {
                    return this.unmaxurl;
                }
                return this.maxurl
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
</style>