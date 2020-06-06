/**
 * LawanCorona Class game by Ahmad Saugi
 */

class LawanCorona {
    constructor({el}) {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.numRow = 5;
        this.numColumn = 5;
        this.blocks = [];
        this.turn = "player";
        this.gameStatus = "playing";

        // Event Listener
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    /**
     * Init the Game.
     */
    start() {
        this.initBoard();
        requestAnimationFrame(() => this.render());
    }

    /**
     * Init the board layout
     */
    initBoard() {
        for(let i = 0; i < this.numRow; i++) {
            for(let j = 0; j < this.numColumn; j++) {
                this.blocks.push({
                    x: this.canvas.width / this.numColumn * j,
                    y: this.canvas.height / this.numRow * i,
                    w: this.canvas.width / this.numColumn,
                    h: this.canvas.height / this.numRow,
                    background: "#34495E",
                    status: null,
                });
            }
        }
        this.blocks.map((block, index) => block.index = index)
    }


    /**
     * Draw board layout.
     */
    draw() {
        this.blocks.forEach(block => {

            this.ctx.fillStyle = block.background;
            this.ctx.fillRect(block.x, block.y, block.w, block.h);

            this.ctx.strokeStyle = "#fff";
            this.ctx.rect(block.x, block.y, block.w, block.h);
            this.ctx.stroke();

            if (block.status == 'player') {
                let image = new Image;
                image.src = "images/player.png";
                this.ctx.drawImage(image, block.x, block.y, block.w, block.h);
            } else if (block.status == 'bot') {
                let image = new Image;
                image.src = "images/opponent.png";
                this.ctx.drawImage(image, block.x, block.y, block.w, block.h);
            }
        })
    }

    update() {
        let kananBawahIndexes = [0, 1, 5, 6];
        let kiriBawahIndexes = [3, 4, 8, 9];
        this.blocks.forEach((block,index) => {
            // Check Horizontal and Vertical
            if ((index + 1) % 5 == 1 || (index + 1) % 5 == 2) {
                if(this.blocks[index].status !== null &&
                    this.blocks[index].status == this.blocks[index+1].status &&
                    this.blocks[index+1].status == this.blocks[index+1+1].status &&
                    this.blocks[index+1+1].status == this.blocks[index+1+1+1].status) {
                        this.win(this.blocks[index].status, [index, index+1, index+1+1, index+1+1+1]);
                    }
                else if(this.blocks[index].status !== null &&
                    this.blocks[index + 5] !== undefined &&
                    this.blocks[index].status == this.blocks[index+5].status &&
                    this.blocks[index+5].status == this.blocks[index+5+5].status &&
                    this.blocks[index+5+5].status == this.blocks[index+5+5+5].status) {
                        this.win(this.blocks[index].status, [index, index+5, index+5+5, index+5+5+5]);
                    }
            }

            // Check kanan bawah
            if(kananBawahIndexes.includes(index)) {
                if (this.blocks[index].status !== null &&
                    this.blocks[index].status == this.blocks[index + 6].status &&
                    this.blocks[index + 6].status == this.blocks[index + 6 + 6].status &&
                    this.blocks[index + 6 + 6].status == this.blocks[index + 6 + 6 + 6].status) {
                        this.win(this.blocks[index].status, [index, index + 6, index + 6 + 6, index + 6 + 6 + 6]);
                }
            }

            // Check kiri bawah
            if (kiriBawahIndexes.includes(index)) {
                if (this.blocks[index].status !== null &&
                    this.blocks[index].status == this.blocks[index + 4].status &&
                    this.blocks[index + 4].status == this.blocks[index + 4 + 4].status &&
                    this.blocks[index + 4 + 4].status == this.blocks[index + 4 + 4 + 4].status) {
                    this.win(this.blocks[index].status, [index, index + 4, index + 4 + 4, index + 4 + 4 + 4]);
                }
            }
        })
    }

    render() {
        this.draw();
        this.update();

        if(this.gameStatus == 'playing') {
            requestAnimationFrame(() => this.render());
        }else{
            // Draw Result Board
            this.draw();
        }
    }

    /**
    * @param {string} name Who win the game.
    * @param {array} indexes Array of indexes who win.
    */
    win(who, indexes) {
        indexes.forEach(index => {
            this.blocks[index].background = "rgba(241, 196, 15, .7)";
        })
        this.gameStatus = 'win';

        // Show Popup
        let alertEl = document.getElementById('alert');

        if(who == 'bot') {
            alertEl.innerHTML = 'Yah, kamu belum berhasil. Coba kembali untuk meraih kemenangan dan akhiri pandemi ini!';
            alertEl.classList.add('show');
        }else{
            alertEl.innerHTML = 'Selamat, kamu berhasil mengalahkan virus corona!';
            alertEl.classList.add('show');
        }
    }

    playerMove(index) {
        if(this.turn == 'player') {
            if(this.blocks[index].status == null) {
                this.blocks[index].status = 'player';
                this.turn = 'bot';
                setTimeout(() => {
                    this.botMove();
                    this.turn = 'player'
                }, 500);
            }
        }
    }

    botMove() {
        let blocksAvailable = this.blocks.filter((block) => block.status == null);
        let blockChoosed = this.getRandomArray(blocksAvailable);
        
        this.blocks[blockChoosed.index].status = 'bot';
        return true;
    }

    handleClick(e) {
        let client = canvas.getBoundingClientRect();

        let mousePosition = {
            x: e.clientX - client.x,
            y: e.clientY - client.y
        }

        this.blocks.forEach((block,index) => {
            let indexClicked = null;
            if(mousePosition.x >= block.x &&
                mousePosition.x <= block.x + block.w &&
                mousePosition.y >= block.y &&
                mousePosition.y <= block.y + block.h) {
                    this.playerMove(index)
                }
        })
    }

    getRandomArray(array) {
        var indexChoosed = Math.floor(Math.random() * array.length);
        return array[indexChoosed]
    }

}