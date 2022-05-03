const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './img/background.png'
})

const player = new Fighter({
    position: {
        x: 100,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    offset: {
        x: 0,
        y: 0
    },
    imageSrc: './img/player/idle.png',
    framesMax: 8,
    offset: { 
        x: 215,
        y: 155
    },
    sprites: {
        idle: {
            imageSrc: './img/player/idle.png',
            framesMax: 8
        },
        run: {
            imageSrc: './img/player/run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './img/player/jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './img/player/fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './img/player/attack1.png',
            framesMax: 6
        },
        takeHit: {
            imageSrc: './img/player/hit2.png',
            framesMax: 4
        },
        death: {
            imageSrc: './img/player/death.png',
            framesMax: 6
        }
    },
    attackBox: {
        offset:  {
            x: 130,
            y: 40
        },
        width: 126,
        height: 50
    }
})

const enemy = new Fighter({
    position: {
        x: 857,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'blue',
    offset: {
        x: -50,
        y: 0
    },
    imageSrc: './img/enemy/idle.png',
    framesMax: 8,
    offset: { 
        x: 215,
        y: 155
    },
    sprites: {
        idle: {
            imageSrc: './img/enemy/idle.png',
            framesMax: 8
        },
        run: {
            imageSrc: './img/enemy/run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './img/enemy/jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './img/enemy/fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './img/enemy/attack1.png',
            framesMax: 6
        },
        takeHit: {
            imageSrc: './img/enemy/hit2.png',
            framesMax: 4
        },
        death: {
            imageSrc: './img/enemy/death.png',
            framesMax: 6
        }
    },
    attackBox: {
        offset:  {
            x: -205,
            y: 40
        },
        width: 126,
        height: 50
    }
})

console.log(player)

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    }
}

decreaseTimer()

function animate() {
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.update()
    player.update()
    enemy.update()
    
    player.velocity.x = 0
    enemy.velocity.x = 0

    // player movement
    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -5
        player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 5
        player.switchSprite('run')
    } else {
        player.switchSprite('idle')
    }

    // player jumping
    if (player.velocity.y < 0) {
        player.switchSprite('jump')
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall')
    }

    // enemy movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5
        enemy.switchSprite('run')
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5
        enemy.switchSprite('run')
    } else {
        enemy.switchSprite('idle')
    }

    // enemy jumping
    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump')
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall')
    }

    // detect for collision & enemy gets hit
    if (
        rectangularCollision({
            rectangle1: player,
            rectangle2: enemy
        }) && 
        player.isAttacking && 
        player.framesCurrent === 4
    ) {
        enemy.takeHit()
        player.isAttacking = false
        document.querySelector('#enemyHealth').style.width = enemy.health + '%'
    }

    // if player misses
    if (player.isAttacking && player.framesCurrent === 4) {
        player.isAttacking = false
    }

    // detect for collision & player gets hit
    if (
        rectangularCollision({
            rectangle1: enemy,
            rectangle2: player
        }) && 
        enemy.isAttacking &&
        enemy.framesCurrent === 4
    ) {
        player.takeHit()
        enemy.isAttacking = false
        document.querySelector('#playerHealth').style.width = player.health + '%'
    }

    // if enemy misses
    if (enemy.isAttacking && enemy.framesCurrent === 4) {
        enemy.isAttacking = false
    }

    // end game based on health
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({ player, enemy, timerId })
    }
}
 
animate()

window.addEventListener('keydown', (event) => {
    if (!player.dead) {
    
        switch (event.key) {
            case 'd':
                keys.d.pressed = true
                player.lastKey = 'd'
                break
            case 'a':
                keys.a.pressed = true
                player.lastKey = 'a'
                break
            case 'w':
            player.velocity.y = -20
                break
            case 's':
                player.attack()
                break
        }
    }

    if (!enemy.dead) {
    
        switch(event.key) {   
            case 'ArrowRight':
                keys.ArrowRight.pressed = true
                enemy.lastKey = 'ArrowRight'
                break
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true
                enemy.lastKey = 'ArrowLeft'
                break
            case 'ArrowUp':
                enemy.velocity.y = -20
                break
            case 'ArrowDown':
                enemy.attack()
                break
        }
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 'w':
            keys.w.pressed = false
            break

        // enemy keys
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
        case 'ArrowUp':
            keys.ArrowUp.pressed = false
            break
    }
})