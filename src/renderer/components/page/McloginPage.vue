<template>
    <div class="page">
        <div id="center">
            <Form ref="login_form" :model="logininfo" :rules="loginValidate">
                <FormItem label="" prop="account">
                    <Input v-model="logininfo.account" placeholder="请输入用户名或邮箱" style="width: 240px"
                        icon="person"></Input>
                </FormItem>
                <FormItem prop="password">
                    <Input v-model="logininfo.password" type="password" placeholder="请输入密码" style="width: 240px"
                        icon="locked" @keyup.enter.native="mclogin('login_form')"></Input>
                </FormItem>
                <FormItem>
                    <Button type="primary" style="width: 240px" @click="mclogin('login_form')">登录</Button>
                </FormItem>

            </Form>
        </div>
    </div>
</template>

<script>
    import crypto from'crypto';
    export default {
        name: 'mclogin',

        data() {
            return {
                loginurl: 'https://api.moecube.com/accounts/signin',
                logininfo: {
                    account: '',
                    password: ''
                },
                loginValidate: {
                    account: [{
                        required: true,
                        message: '请填写你的邮箱或用户名!',
                        trigger: 'blur'
                    }],
                    password: [{
                        required: true,
                        message: '请填写你的密码!',
                        trigger: 'blur'
                    }]
                }
            }
        },
        components: {

        },
        methods: {
            mclogin(name) {
                let that = this;
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        let logininfo = that.logininfo;
                        that.$http.post(that.loginurl, logininfo).then(function (
                                response) {
                                if (response.status == 200) {
                                    that.$Message.success('登录成功');
                                    that.$db.findOne({
                                        name: 'mcuser'
                                    }, (err, ret) => {
                                        if (ret == null) {
                                            that.$db.insert({
                                                name: 'mcuser',
                                                value: response.data
                                            }, (err, ret) => {});
                                        } else {
                                            that.$db.update({
                                                name: 'mcuser'
                                            }, {
                                                $set: {
                                                    name: 'mcuser',
                                                    value: response.data
                                                }
                                            }, (err, ret) => {});
                                        }
                                    });
                                    that.$router.replace({
                                        name: 'mcserver',
                                    });
                                } else {
                                    that.$Message.error('登录异常');
                                }
                            })
                            .catch(function (error) {
                                if (error.response.data.message == 'i_password_error') {
                                    that.$Message.error('密码错误');
                                } else {
                                    that.$Message.error('登录异常');
                                }
                            });
                    }
                })
            },

        },
        created() {

        },
    }
</script>

<style>
    #center {
        width: 400px;
        height: 200px;
        position: absolute;
        text-align: center;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
        padding-left: 200px;
    }

    .login-from {
        padding-bottom: 20px;
    }
</style>