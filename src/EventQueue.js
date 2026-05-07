// EventQueue.js - Batching system for intelligence events
// Matches Flutter SDK implementation

export class EventQueue {
  constructor(backendUrl, debug = false) {
    this.backendUrl = backendUrl;
    this.debug = debug;
    this.queue = [];
    this.timer = null;
    this.isFlushing = false;
    
    // Config matching Flutter SDK
    this.maxBatchSize = 10;
    this.batchInterval = 2000; // 2 seconds
    this.maxQueueSize = 30;
  }

  /**
   * Add event to queue
   */
  enqueue(event) {
    // FIFO - drop oldest if queue full
    if (this.queue.length >= this.maxQueueSize) {
      this.queue.shift();
    }

    this.queue.push(event);

    // Flush immediately if batch size reached
    if (this.queue.length >= this.maxBatchSize) {
      this.flush();
    } else {
      // Reset timer
      this.resetTimer();
    }
  }

  /**
   * Reset batch timer
   */
  resetTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.flush();
    }, this.batchInterval);
  }

  /**
   * Flush queue to backend
   */
  async flush() {
    // Guard against concurrent flushes
    if (this.isFlushing || this.queue.length === 0) {
      return;
    }

    this.isFlushing = true;

    // Clear timer
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    try {
      // Take up to maxBatchSize events
      const eventsToSend = this.queue.splice(0, this.maxBatchSize);

      // Send as JSON array
      const response = await fetch(this.backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventsToSend),
        timeout: 10000, // 10s timeout
      });

      // If more events remain, reset timer
      if (this.queue.length > 0) {
        this.resetTimer();
      }
    } catch (error) {
      // Fail silently - don't crash the app
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Clear all queued events
   */
  clear() {
    this.queue = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * Destroy queue
   */
  destroy() {
    this.clear();
    this.isFlushing = false;
  }
}
