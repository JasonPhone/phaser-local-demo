import "phaser";

export class WelcomeScene extends Phaser.Scene {
    title: Phaser.GameObjects.Text;
    hint: Phaser.GameObjects.Text;

    constructor() {
        super({
            key: "WelcomeScene"
        });
    }

    create(): void {
        var titleText: string = "项目战士";
        this.title = this.add.text(260, 200, titleText,
            { font: '60px Arial Bold', color: '#FBFBAC' });

        var hintText: string = "点击进入游戏";
        this.hint = this.add.text(300, 350, hintText,
            { font: '24px Arial Bold', color: '#FBFBAC' });

        this.input.on('pointerdown', function (/*pointer*/) {
            this.scene.start("LoginScene");
        }, this);
    }
};