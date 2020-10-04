const workersSupported = (typeof Worker !== "undefined");
const isInWebWorker = (typeof document === "undefined");

/**
 * LawanCorona Class game by Ahmad Saugi
 */

class LawanCorona {
    static PLAYER_TAG = 'player'
    static BOT_TAG ='bot'
    static WIN_STATE = 'win'
    static LOSE_STATE = 'lose'
    static PLAYING_STATE = 'playing'

    constructor({el}) {
        this.numRow = 5;
        this.numColumn = 5;
        this.blocks = [];
        this.turn = LawanCorona.PLAYER_TAG;
        this.gameStatus = LawanCorona.PLAYING_STATE;
        
        if(!isInWebWorker && workersSupported) {
            this.botWorker = new Worker('/js/LawanCorona.js');
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');
            // Event Listener
            this.canvas.addEventListener('click', (e) => this.handleClick(e));
            this.botWorker.onmessage = (e) => {
                if(e.data) {
                  const blockChoosed = e.data;
                  this.blocks[blockChoosed.index].status = LawanCorona.BOT_TAG;
                  this.turn = LawanCorona.PLAYER_TAG;
                }
            }
        }
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

            if (block.status == LawanCorona.PLAYER_TAG) {
                let image = new Image;
                image.src = "images/player.png";
                this.ctx.drawImage(image, block.x, block.y, block.w, block.h);
            } else if (block.status == LawanCorona.BOT_TAG) {
                let image = new Image;
                image.src = "images/opponent.png";
                this.ctx.drawImage(image, block.x, block.y, block.w, block.h);
            }
        })
    }

    update() {
        LawanCorona._checkWin(this.blocks, this.win.bind(this))
    }

    static _checkWin(blocks, callback) {
      let kananBawahIndexes = [0, 1, 5, 6];
      let kiriBawahIndexes = [3, 4, 8, 9];
      blocks.forEach((block,index) => {
        // Check Horizontal and Vertical
        if ((index + 1) % 5 < 3) {
            if(blocks[index].status !== null &&
                blocks.length >= 1 + index+1+1+1 &&
                blocks[index].status == blocks[index+1].status &&
                blocks[index+1].status == blocks[index+1+1].status &&
                blocks[index+1+1].status == blocks[index+1+1+1].status) {
                    callback(blocks[index].status, [index, index+1, index+1+1, index+1+1+1]);
                }
            else if(blocks[index].status !== null &&
                blocks.length >= 1 + index+5+5+5 &&
                blocks[index + 5] !== undefined &&
                blocks[index].status == blocks[index+5].status &&
                blocks[index+5].status == blocks[index+5+5].status &&
                blocks[index+5+5].status == blocks[index+5+5+5].status) {
                    callback(blocks[index].status, [index, index+5, index+5+5, index+5+5+5]);
                }
        }

        // Check kanan bawah
        if(kananBawahIndexes.includes(index)) {
            if (blocks[index].status !== null &&
                blocks.length >= 1 + index + 6 + 6 + 6 &&
                blocks[index].status == blocks[index + 6].status &&
                blocks[index + 6].status == blocks[index + 6 + 6].status &&
                blocks[index + 6 + 6].status == blocks[index + 6 + 6 + 6].status) {
                    callback(blocks[index].status, [index, index + 6, index + 6 + 6, index + 6 + 6 + 6]);
            }
        }

        // Check kiri bawah
        if (kiriBawahIndexes.includes(index)) {
            if (blocks[index].status !== null &&
                blocks.length >= 1 + index + 4 + 4 + 4 &&
                blocks[index].status == blocks[index + 4].status &&
                blocks[index + 4].status == blocks[index + 4 + 4].status &&
                blocks[index + 4 + 4].status == blocks[index + 4 + 4 + 4].status) {
                callback(blocks[index].status, [index, index + 4, index + 4 + 4, index + 4 + 4 + 4]);
            }
        }
    })
    }

    render() {
        this.draw();
        this.update();

        if(this.gameStatus == LawanCorona.PLAYING_STATE) {
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

        // Show Popup
        let alertEl = document.getElementById('alert');

        if(who == LawanCorona.BOT_TAG) {
            alertEl.innerHTML = 'Yah, kamu belum berhasil. Coba kembali untuk meraih kemenangan dan akhiri pandemi ini!';
            alertEl.classList.add('show');
            this.gameStatus = LawanCorona.LOSE_STATE;
        }else{
            alertEl.innerHTML = 'Selamat, kamu berhasil mengalahkan virus corona!';
            alertEl.classList.add('show');
            this.gameStatus = LawanCorona.WIN_STATE;
        }
    }

    playerMove(index) {
        if(this.turn == LawanCorona.PLAYER_TAG) {
            if(this.blocks[index].status == null) {
                this.blocks[index].status = LawanCorona.PLAYER_TAG;
                this.turn = LawanCorona.BOT_TAG;
                setTimeout(() => {
                    this.botMove();
                }, 500);
            }
        }
    }

    botMove() {
        // let blocksAvailable = this.blocks.filter((block) => block.status == null);
        // let blockChoosed = this.getRandomArray(blocksAvailable);
        if (workersSupported && !isInWebWorker) {
          this.botWorker.postMessage([this.blocks, 3, LawanCorona.BOT_TAG, LawanCorona.PLAYER_TAG, true]);
        } else {
            let blockChoosed = LawanCorona._minimax(this.blocks, 2, LawanCorona.BOT_TAG, LawanCorona.PLAYER_TAG, true)
            this.blocks[blockChoosed.index].status = LawanCorona.BOT_TAG;
            this.turn = LawanCorona.PLAYER_TAG
        }
    }

    // node is a board
    static _minimax(node, depth, a_player, b_player, a_maximize){
      const blocksAvailable = node.filter((block) => block.status == null); 
      const scoreMoves = new Array(blocksAvailable.length);
      let bestMove;

      if (depth === 0 || blocksAvailable.length === 0) {
        let score = 0
        LawanCorona._checkWin(node, function (who) {
          if(who === a_player) {
            score = a_maximize ? 10 : -10
          } else if(who === b_player ) {
            score = a_maximize ? -10 : 10
          } else {
            score = 0
          }
        })
        return {score: score}
      }
      blocksAvailable.forEach((block, index) =>  {
        const pos = node.indexOf(block)
        const moves = JSON.parse(JSON.stringify(node)); // copy
        moves[pos].status = a_player
        scoreMoves[index] = block
        
        let result = LawanCorona._minimax(moves, depth - 1, b_player, a_player, !a_maximize);
        scoreMoves[index].score = result.score
      })

      if (a_maximize) {
        var bestScore = -Infinity;
        for (var i = 0; i < scoreMoves.length; i++) {
            if (scoreMoves[i].score > bestScore) {
                bestScore = scoreMoves[i].score;
                bestMove = scoreMoves[i];
            }
        }
      } else {
          var bestScore = Infinity;
          for (var i = 0; i < scoreMoves.length; i++) {
              if (scoreMoves[i].score < bestScore) {
                  bestScore = scoreMoves[i].score;
                  bestMove = scoreMoves[i];
              }
          }
      }

      return bestMove
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

self.onmessage = function(e) {
  if(e.data) {
    const move = LawanCorona._minimax(e.data[0], e.data[1], e.data[2], e.data[3], e.data[4])
    self.postMessage(move);
  }
}
self.postMessage(false)
