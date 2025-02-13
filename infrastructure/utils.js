const GAME_SPEED = 500;
const boardSize = 20;

function hasCollision(players, guid1, guid2) {
	const mySnakeHead = players[guid1].snake[0];
	const otherSnakeHead = players[guid2].snake[0];

	if (!isInsideBoard(mySnakeHead) || !isInsideBoard(otherSnakeHead)) {
		return true;
	}

	for (let i = 1; i < players[guid1].snake.length; i++) {
		if (isSamePosition(mySnakeHead, players[guid1].snake[i])) {
			return true;
		}
	}

	for (let i = 1; i < players[guid2].snake.length; i++) {
		if (isSamePosition(otherSnakeHead, players[guid2].snake[i])) {
			return true;
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