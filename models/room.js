class Room {
    constructor(id, guids) {
        this.id = id;
        this.guids = [...guids];
        this.#initData();
    }

    #initData() {
        this.state = Array.from({ length: 20 }, () => Array(20).fill(0));
        this.data = {};
        this.data[this.guids[0]] = {
            position: { x: 2, y: 2 },
            direction: { x: 1, y: 0 },
        };
        this.data[this.guids[1]] = {
            position: { x: 18, y: 18 },
            direction: { x: -1, y: 0 },
        };
    }
}

module.exports = Room;