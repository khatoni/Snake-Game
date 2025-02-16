const { hasCollision, BOARD_SIZE } = require("../infrastructure/utils");

class Room {
	constructor(id, guids) {
		this.id = id;
		this.guids = [...guids];
		this.#initData();
		this.intervalId = null;
		this.timeoutId = null;
	}

	clear() {
		clearInterval(this.intervalId);
		clearTimeout(this.timeoutId);
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
		this.data.bricks = [];
		this.#generateBricks();

		this.shouldGenerateFood = false;
	}
	#isNearStart(x, y, startX, startY) {
		return (
			startX - 2 <= x &&
			x <= startX + 2 &&
			startY - 2 <= y &&
			y <= startY + 2
		);
	}
	#generateBricks() {
		this.data.bricks.push({ x: 1, y: 2 });
		this.state[1][2] = 50;
		for (let i = 0; i < 5; i++) {
			while (true) {
				const x = (Math.round(Math.random() * 20) % 20) + 1;
				const y = (Math.round(Math.random() * 20) % 20) + 1;
				if (
					this.state[x][y] == 0 &&
					!this.#isNearStart(x, y, 2, 2) &&
					!this.#isNearStart(x, y, 18, 18)
				) {
					this.state[x][y] = 50;
					this.data.bricks.push({ x, y });
					break;
				}
			}
		}
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
		if (!this.shouldGenerateFood) {
			return;
		}

		while (
			this.state[this.data.food.x][this.data.food.y] !== 0 &&
			this.#bricksAroundFood(this.data.food.x, this.data.food.y) <= 2
		) {
			this.data.food = {
				x: Math.floor(Math.random() * BOARD_SIZE) + 1,
				y: Math.floor(Math.random() * BOARD_SIZE) + 1,
			};
		}

		this.shouldGenerateFood = false;
	}

	// input new food x, new food y
	#bricksAroundFood(x, y) {
		let brickSidesCount = 0;
		if (x - 1 <= 0 || this.state[x - 1][y] == 50) {
			brickSidesCount++;
		}
		if (x + 1 > 20 || this.state[x + 1][y] == 50) {
			brickSidesCount++;
		}
		if (y + 1 > 20 || this.state[x][y + 1] == 50) {
			brickSidesCount++;
		}
		if (y - 1 <= 0 || this.state[x][y - 1] == 50) {
			brickSidesCount++;
		}
		return brickSidesCount;
	}

	#movePlayer(player) {
		const currentSnakeHead = player.snake[0];
		const newSnakeHead = {
			x: currentSnakeHead.x + player.direction.x,
			y: currentSnakeHead.y + player.direction.y,
		};
		player.snake.unshift(newSnakeHead);
		this.state[newSnakeHead.x][newSnakeHead.y] = player.gameId;

		if (
			newSnakeHead.x === this.data.food.x &&
			newSnakeHead.y === this.data.food.y
		) {
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
