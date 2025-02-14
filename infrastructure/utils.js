const GAME_SPEED = 500;
const boardSize = 20;

function hasCollision(players, guid1, guid2) {
	const snakeHeadGuid1 = players[guid1].snake[0];
	const snakeHeadGuid2 = players[guid2].snake[0];
	const answer = {};

	if(isSamePosition(snakeHeadGuid1, snakeHeadGuid2)) {
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

	return false;
}

function isSamePosition(position1, position2) {
	return position1.x === position2.x && position1.y === position2.y;
}

function isInsideBoard(position) {
	return (
		position.x >= 1 &&
		position.x <= boardSize &&
		position.y >= 1 &&
		position.y <= boardSize
	);
}

module.exports = {
    GAME_SPEED,
    hasCollision,
    isSamePosition,
    isInsideBoard,
};