const GAME_SPEED = 500;
const BOARD_SIZE = 20;

function hasCollision(players, guid1, guid2) {
	const snakeHeadGuid1 = players[guid1].snake[0];
	const snakeHeadGuid2 = players[guid2].snake[0];
	const answer = {};

	if (isSamePosition(snakeHeadGuid1, snakeHeadGuid2)) {
		answer.winner = null;
		return answer;
	}

	if (!isInsideBoard(snakeHeadGuid1)) {
		answer.winner = guid2;
		return answer;
	}

	if (!isInsideBoard(snakeHeadGuid2)) {
		answer.winner = guid1;
		return answer;
	}

	for (let i = 1; i < players[guid1].snake.length; i++) {
		if (isSamePosition(snakeHeadGuid1, players[guid1].snake[i])) {
			answer.winner = guid2;
			return answer;
		}
		if (isSamePosition(snakeHeadGuid2, players[guid1].snake[i])) {
			answer.winner = guid1;
			return answer;
		}
	}

	for (let i = 1; i < players[guid2].snake.length; i++) {
		if (isSamePosition(snakeHeadGuid2, players[guid2].snake[i])) {
			answer.winner = guid1;
			return answer;
		}
		if (isSamePosition(snakeHeadGuid1, players[guid2].snake[i])) {
			answer.winner = guid2;
			return answer;
		}
	}

	const bricks = players.bricks;
	for (let i = 0; i < bricks.length; i++) {
		if (isSamePosition(bricks[i], snakeHeadGuid1)) {
			answer.winner = guid2;
			return answer;
		}
		if (isSamePosition(bricks[i], snakeHeadGuid2)) {
			answer.winner = guid1;
			return answer;
		}
	}

	return false;
}

function isSamePosition(position1, position2) {
	return position1.x === position2.x && position1.y === position2.y;
}

function isInsideBoard(position) {
	return (
		position.x >= 1 &&
		position.x <= BOARD_SIZE &&
		position.y >= 1 &&
		position.y <= BOARD_SIZE
	);
}

module.exports = {
	GAME_SPEED,
	BOARD_SIZE,
	hasCollision,
	isSamePosition,
	isInsideBoard,
};
