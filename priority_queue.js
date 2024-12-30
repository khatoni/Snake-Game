class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    // Helper function to get the index of the parent
    getParentIndex(index) {
        return Math.floor((index - 1) / 2);
    }

    // Helper function to get the indices of the children
    getLeftChildIndex(index) {
        return 2 * index + 1;
    }

    getRightChildIndex(index) {
        return 2 * index + 2;
    }

    // Helper function to check if a node is a leaf
    isLeaf(index) {
        const leftChildIndex = this.getLeftChildIndex(index);
        const rightChildIndex = this.getRightChildIndex(index);
        return leftChildIndex >= this.heap.length && rightChildIndex >= this.heap.length;
    }

    // Helper function to swap elements in the heap
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    // Insert a new element into the heap
    push(value) {
        this.heap.push(value);
        let index = this.heap.length - 1;
        
        // Bubble-up (heapify-up) the value
        while (index > 0 && this.heap[this.getParentIndex(index)] > this.heap[index]) {
            this.swap(this.getParentIndex(index), index);
            index = this.getParentIndex(index);
        }
    }

    // Remove and return the minimum element (root)
    pop() {
        if (this.heap.length === 0) return null;

        const min = this.heap[0];
        const last = this.heap.pop();
        
        if (this.heap.length === 0) return min;
        
        this.heap[0] = last;
        this.heapify(0);
        
        return min;
    }

    // Helper function to maintain heap property after extraction
    heapify(index) {
        if (this.isLeaf(index)) return;

        const leftChildIndex = this.getLeftChildIndex(index);
        const rightChildIndex = this.getRightChildIndex(index);

        let smallest = index;

        if (leftChildIndex < this.heap.length && this.heap[leftChildIndex] < this.heap[smallest]) {
            smallest = leftChildIndex;
        }

        if (rightChildIndex < this.heap.length && this.heap[rightChildIndex] < this.heap[smallest]) {
            smallest = rightChildIndex;
        }

        if (smallest !== index) {
            this.swap(smallest, index);
            this.heapify(smallest);
        }
    }

    // Peek the minimum element (but don't remove it)
    peek() {
        return this.heap[0];
    }

    // Get the size of the heap
    size() {
        return this.heap.length;
    }
}

module.exports = PriorityQueue;