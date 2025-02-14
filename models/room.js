const { hasCollision } = require("../infrastructure/utils");

class Room {
	constructor(id, guids) {
		this.id = id;
		this.guids = [...guids];
		this.#initData();
		this.intervalId = null;
	}

	#initData() {
		this.state = Array.from({ length: 22 }, () => Array(22).fill(0));
		this.data = {};
		this.data[this.guids[0]] = {
            guid: this.guids[0],
			gameId: 1,
			snake: [{ x: 2, y: 2 }],
			direction: { x: 1, y: 0 },
		};
		this.data[this.guids[1]] = {
            guid: this.guids[1],
			gameId: 2,
			snake: [{ x: 18, y: 18 }],
			direction: { x: -1, y: 0 },
		};
		this.data.food = { x: 10, y: 10 };
        this.data.guids = this.guids;
		this.shouldGenerateFood = false;
	}

	updatePlayer(guid, direction) {
		this.data[guid].direction = direction;
	}

	makeMove() {
        let growGuid = undefined;
		for (const guid of this.guids) {
			growGuid = this.#movePlayer(this.data[guid]) || growGuid;
		}
        return growGuid;
	}

    hasCollision() {
        return hasCollision(this.data, this.guids[0], this.guids[1]);
    }

    generateFood() {
        if(!this.shouldGenerateFood) {
            return;
        }

        while(this.state[this.data.food.x][this.data.food.y] !== 0) {
            this.data.food = {
                x: Math.floor(Math.random() * 20),
                y: Math.floor(Math.random() * 20),
            };
        }

        this.shouldGenerateFood = false;
    }

	#movePlayer(player) {
		const currentSnakeHead = player.snake[0];
		const newSnakeHead = {
			x: currentSnakeHead.x + player.direction.x,
			y: currentSnakeHead.y + player.direction.y,
		};
		player.snake.unshift(newSnakeHead);
		this.state[newSnakeHead.x][newSnakeHead.y] = player.gameId;

		if (newSnakeHead.x === this.data.food.x && newSnakeHead.y === this.data.food.y) {
			this.shouldGenerateFood = true;
            return player.guid;
		} else {
			const snakeTail = player.snake[player.snake.length - 1];
			this.state[snakeTail.x][snakeTail.y] = 0;
			player.snake.pop();
		}
	}
}

module.exports = Room;
