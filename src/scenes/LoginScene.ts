import "phaser";
import bg from "../assets/images/citybg.png";
import loginform from "../assets/text/loginform.html";
import registerform from "../assets/text/registerform.html";
import { PlayerInfo, RoleType } from "../types/common";
import $ from "jquery";

export class LoginScene extends Phaser.Scene {
    constructor() {
        super({
            key: "LoginScene"
        });
    }

    preload() {
        this.load.image('bg', bg);
        this.load.html('loginform', loginform);
        this.load.html('registerform', registerform);
    }

    create(): void {
        this.add.image(0, 0, 'bg').setOrigin(0, 0);
        var loginformElement = this.add.dom(400, 600).createFromHTML(loginform);
        var registerformElement = this.add.dom(400, 300).createFromHTML(registerform);
        loginformElement.setPerspective(800);
        registerformElement.setPerspective(800);

        registerformElement.setVisible(false);

        var startText = this.add.text(10, 10, 'Please Login to Play', { color: 'white', fontFamily: 'Arial', fontSize: '32px' });

        const self = this;

        // loginformElement
        loginformElement.addListener('click');
        loginformElement.on('click', function (event: any) {

            // switch to Register
            if (event.target.name === 'toRegister') {
                loginformElement.setVisible(false);
                registerformElement.setVisible(true);
                this.scene.tweens.add({ targets: registerformElement.rotate3d, x: 1, w: 360, duration: 1200, ease: 'Power3' });
                startText.setText('Please Register to Play');
                this.scene.tweens.add({ targets: startText, alpha: 0.1, duration: 200, ease: 'Power3', yoyo: true });
            }

            // login
            if (event.target.name === 'loginButton') {
                var inputUsername = this.getChildByName('username').value;
                var inputPassword = this.getChildByName('password').value;
                const loginSelf = this;
                var zg = /^[0-9a-zA-Z]*$/; // to check if str is made of numbers and letters

                if (inputUsername == '' || inputPassword == '') {
                    alert("输入为空, 请输入正确的值！");
                    this.getChildByName('username').value = '';
                    this.getChildByName('password').value = '';
                    return;
                }
                if (!zg.test(inputUsername) || !zg.test(inputPassword)) {
                    alert("输入了非法字符，请检查！\n(用户名和密码只能由英文字母和数字字符组成)");
                    this.getChildByName('username').value = '';
                    this.getChildByName('password').value = '';
                    return;
                }
                var data = {
                    "username": inputUsername,
                    "password": inputPassword,
                }
                $.ajax({
                    type: "post",
                    url: "http://81.68.250.183:2567/user/login",
                    async: true,
                    dataType: "json",
                    // jsonpCallback: "successCallback", // zyn
                    data: JSON.stringify(data),
                    success: function (result: any) {//后台返回result
                        if (result.status == 2) { // Login Success
                            const rnd = Math.random();  // get role type randomly
                            let role_tp = RoleType.NULL;
                            if (rnd <= 0.3) {
                                role_tp = RoleType.ADC;
                            } else if (rnd <= 0.6) {
                                role_tp = RoleType.SUP;
                            } else {
                                role_tp = RoleType.TNK;
                            }
                            self.scene.start("GameScene", {name: inputUsername, team: 0, role: role_tp});
                            return;
                        } else if (result.status == 1) { // Login Password Not Correct
                            alert("账号与密码不匹配，请重新输入！");
                            loginSelf.getChildByName('username').value = '';
                            loginSelf.getChildByName('password').value = '';
                        } else if (result.status == 0) { // Login Name Not Exist
                            alert("账号不存在，请检查！");
                            loginSelf.getChildByName('username').value = '';
                            loginSelf.getChildByName('password').value = '';
                        } else {
                            alert("对不起，请求出错！");
                        }
                    },
                    error: function (result: any) {
                        alert("对不起，请求出错！");
                    }
                });
            }
        }

        );

        // registerformElement
        registerformElement.addListener('click');

        registerformElement.on('click', function (event: any) {

            // switch to login
            if (event.target.name === 'toLogin') {
                registerformElement.setVisible(false);
                loginformElement.setVisible(true);
                this.scene.tweens.add({ targets: loginformElement.rotate3d, x: -1, w: 360, duration: 1200, ease: 'Power3' });
                startText.setText('Please Login to Play');
                this.scene.tweens.add({ targets: startText, alpha: 0.1, duration: 200, ease: 'Power3', yoyo: true });
            }

            // register
            if (event.target.name === 'registerButton') {
                var inputUsername = this.getChildByName('username').value;
                var inputPassword = this.getChildByName('password').value;
                var inputConfirmPassword = this.getChildByName('confirmPassword').value;
                const registerSelf = this;

                var zg = /^[0-9a-zA-Z]*$/; // to check if str is made of numbers and letters

                if (inputUsername == '' || inputPassword == '' || inputConfirmPassword == '') {
                    alert("输入为空, 请输入正确的值！");
                    this.getChildByName('username').value = '';
                    this.getChildByName('password').value = '';
                    this.getChildByName('confirmPassword').value = '';
                    return;
                }
                if (!zg.test(inputUsername) || !zg.test(inputPassword) || !zg.test(inputConfirmPassword)) {
                    alert("输入了非法字符，请检查！\n(用户名和密码只能由英文字母和数字字符组成)");
                    this.getChildByName('username').value = '';
                    this.getChildByName('password').value = '';
                    this.getChildByName('confirmPassword').value = '';
                    return;
                }
                if (inputPassword != inputConfirmPassword) {
                    alert("两次密码输入不一致，请检查！");
                    this.getChildByName('password').value = '';
                    this.getChildByName('confirmPassword').value = '';
                    return;
                }
                // TODO: connect with server
                var data = {
                    "username": inputUsername,
                    "password": inputPassword,
                }
                $.ajax({
                    type: "post",
                    url: "http://81.68.250.183:2567/user/register",
                    async: true,
                    dataType: "json",
                    // jsonpCallback: "successCallback", // zyn
                    data: JSON.stringify(data),
                    success: function (result: any) {//后台返回result
                        if (result.status == 0) { // Register Success
                            alert("账号注册成功！");
                            registerformElement.setVisible(false);
                            loginformElement.setVisible(true);
                            registerSelf.scene.tweens.add({ targets: loginformElement.rotate3d, x: -1, w: 360, duration: 1200, ease: 'Power3' });
                            startText.setText('Please Login to Play');
                            registerSelf.scene.tweens.add({ targets: startText, alpha: 0.1, duration: 200, ease: 'Power3', yoyo: true });
                            return;
                        } else if (result.status == 1) { // Register Name Existed
                            alert("账号已注册，请重新输入！");
                            registerSelf.getChildByName('username').value = '';
                            registerSelf.getChildByName('password').value = '';
                            registerSelf.getChildByName('confirmPassword').value = '';
                        } else {
                            alert("对不起，请求出错！");
                        }
                    },
                    error: function (result: any) {
                        alert("对不起，请求出错！");
                    }
                });
            }

        });

        // Login box appear effect
        this.tweens.add({
            targets: loginformElement,
            y: 300,
            duration: 1500,
            ease: 'Power3'
        });
    }
};
