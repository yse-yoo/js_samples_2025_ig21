import * as THREE from 'https://unpkg.com/three@0.155.0/build/three.module.js';

export class Car {
    constructor(textureLoader) {
        this.startX = 100;
        this.startY = 200;
        this.startRotation = 90 * Math.PI / 180; // -75度をラジアンに変換
        this.friction = 0.02;
        this.width = 30;
        this.height = 30;
        this.image = 'assets/car.png';
        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(this.width, this.height),
            new THREE.MeshBasicMaterial({
                map: textureLoader.load(this.image),
                transparent: true,
                side: THREE.DoubleSide
            })
        );
        this.mesh.position.set(this.startX, this.startY, 2);
        this.mesh.rotation.z = this.startRotation;

        this.speed = 0;
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;
        this.crashed = false;

        this.forwardAcceleration = 0.01;
        this.forwardMaxSpeed = 1.8;
        this.backwardAcceleration = 0.04;
        this.backwardMaxSpeed = 0.5;
        this.rotationSpeed = 0.03;
    }

    update() {
        const angle = this.mesh.rotation.z - Math.PI / 2;

        if (this.left) this.mesh.rotation.z += this.rotationSpeed;
        if (this.right) this.mesh.rotation.z -= this.rotationSpeed;

        // 衝突時と通常時で摩擦を変える
        const friction = this.crashed ? 0.1 : 0.02;

        if (this.crashed) {
            // 衝突中は加減速せず、摩擦でのみ減速
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - friction);
            } else if (this.speed < 0) {
                this.speed = Math.min(0, this.speed + friction);
            }

            // 停止したら衝突解除（任意）
            if (Math.abs(this.speed) < 0.01) {
                this.speed = 0.1;
                this.crashed = false;
            }
        } else {
            // 通常時の加速／減速
            if (this.forward && !this.backward) {
                this.speed += this.forwardAcceleration;
            } else if (this.backward && !this.forward) {
                this.speed -= this.backwardAcceleration;
            } else {
                if (this.speed > 0) {
                    this.speed = Math.max(0, this.speed - friction);
                } else if (this.speed < 0) {
                    this.speed = Math.min(0, this.speed + friction);
                }
            }

            // 速度制限
            this.speed = Math.min(this.speed, this.forwardMaxSpeed);
            this.speed = Math.max(this.speed, -this.backwardMaxSpeed);
            this.speed += Math.random() * 0.01 - 0.005; // ランダムな揺らぎ
        }

        // 移動
        this.mesh.position.x -= Math.cos(angle) * this.speed;
        this.mesh.position.y -= Math.sin(angle) * this.speed;
    }

    getFrontPosition() {
        const angle = this.mesh.rotation.z - Math.PI / 2;
        return new THREE.Vector2(
            this.mesh.position.x - Math.cos(angle) * 15,
            this.mesh.position.y - Math.sin(angle) * 15
        );
    }

    reset() {
        this.mesh.position.set(this.startX, this.startY, 2);
        this.mesh.rotation.z = 0;
        this.speed = 0;
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;
        this.crashed = false;
    }
}
