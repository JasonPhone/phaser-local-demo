import "phaser";
import bg from "../assets/images/citybg.png";
import loginform from "../assets/text/loginform.html";
import registerform from "../assets/text/registerform.html";
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

        const self = this;// zyn

        // loginformElement
        loginformElement.addListener('click');
        loginformElement.on('click', function (event: any) {

            // switch to Register
            if (event.target.name === 'toRegister') {
                loginformElement.setVisible(false);
                registerformElement.setVisible(true);
                this.scene.tweens.add({ targets: registerformElement.rotate3d, x: 1, w: 360, duration: 3000, ease: 'Power3' });
                startText.setText('Please Register to Play');
                this.scene.tweens.add({ targets: startText, alpha: 0.1, duration: 200, ease: 'Power3', yoyo: true });
            }

            // login
            if (event.target.name === 'loginButton') {
                var inputUsername = this.getChildByName('username').value;
                var inputPassword = this.getChildByName('password').value;

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
                    dataType: "jsonp",
                    jsonpCallback: "successCallback",
                    data: data,
                    success: function (result: any) {//后台返回result
                        console.log(result);// zyn
                        if (result.status == 0) { // status值为0表示账号与密码匹配正确
                            this.removeListener('click');
                            self.scene.start("GameScene"); // zyn
                            return;
                        } else { // 否则匹配不正确，登录失败。
                            alert("账号与密码不匹配，请重新输入！");
                            this.getChildByName('username').value = '';
                            this.getChildByName('password').value = '';
                        }
                    },
                    error: function (result: any) {
                        console.log(result);
                        // alert("对不起，请求出错！");
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
                this.scene.tweens.add({ targets: loginformElement.rotate3d, x: -1, w: 360, duration: 3000, ease: 'Power3' });
                startText.setText('Please Login to Play');
                this.scene.tweens.add({ targets: startText, alpha: 0.1, duration: 200, ease: 'Power3', yoyo: true });
            }

            // register
            if (event.target.name === 'registerButton') {
                var inputUsername = this.getChildByName('username').value;
                var inputPassword = this.getChildByName('password').value;
                var inputConfirmPassword = this.getChildByName('confirmPassword').value;

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
                    dataType: "jsonp",
                    jsonpCallback: "successCallback",
                    data: data,
                    success: function (result: any) {//后台返回result
                        console.log(result);// zyn
                        if (result.status == 0) { // status值为0表示账号未注册
                            alert("账号注册成功！");
                            registerformElement.setVisible(false);
                            loginformElement.setVisible(true);
                            this.scene.tweens.add({ targets: loginformElement.rotate3d, x: -1, w: 360, duration: 3000, ease: 'Power3' });
                            startText.setText('Please Login to Play');
                            this.scene.tweens.add({ targets: startText, alpha: 0.1, duration: 200, ease: 'Power3', yoyo: true });
                            return;
                        } else { // 否则匹配不正确，登录失败。
                            alert("账号已注册，请重新输入！");
                            this.getChildByName('username').value = '';
                            this.getChildByName('password').value = '';
                            this.getChildByName('inputConfirmPassword').value = '';
                        }
                    },
                    error: function (result: any) {
                        console.log(result);
                        // alert("对不起，请求出错！");
                    }
                });
            }

        });

        // Login box appear effect
        this.tweens.add({
            targets: loginformElement,
            y: 300,
            duration: 3000,
            ease: 'Power3'
        });
    }
};
