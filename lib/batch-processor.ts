import { ActivityEvent, processActivityEvent } from '@/lib/event-processor';

interface QueuedEvent {
  id: string;
  event: ActivityEvent;
  retryCount: number;
  timestamp: number;
}

class EventBatchProcessor {
  private queue: QueuedEvent[] = [];
  private processing = false;
  private readonly BATCH_SIZE = 50;
  private readonly BATCH_INTERVAL = 1000; // 1 second

  constructor() {
    // Start batch processing loop
    setInterval(() => this.processBatch(), this.BATCH_INTERVAL);
  }

  async addEvent(event: ActivityEvent): Promise<void> {
    const queuedEvent: QueuedEvent = {
      id: `${event.userId}_${event.timestamp}_${Date.now()}`, // Ensure uniqueness
      event,
      retryCount: 0,
      timestamp: Date.now(),
    };

    this.queue.push(queuedEvent);

    // If queue is getting large, trigger immediate processing
    if (this.queue.length >= this.BATCH_SIZE && !this.processing) {
      // Don't await this to avoid blocking the addEvent call
      this.processBatch();
    }
  }

  private async processBatch(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      // Take batch from queue
      const batch = this.queue.splice(0, Math.min(this.BATCH_SIZE, this.queue.length));

      if (batch.length === 0) {
        return; // No events to process
      }

      console.log(`Processing batch of ${batch.length} events`);

      // Process in parallel with controlled concurrency
      const results = await Promise.allSettled(
        batch.map(async (queuedEvent) => {
          try {
            await processActivityEvent(queuedEvent.event);
            console.log(`Successfully processed event: ${queuedEvent.id}`);
            return { success: true, eventId: queuedEvent.id };
          } catch (error) {
            console.error(`Failed to process event ${queuedEvent.id}:`, error);

            // Re-queue if not exceeded retry limit
            if (queuedEvent.retryCount < 3) {
              queuedEvent.retryCount++;
              this.queue.push(queuedEvent); // Add back to queue for retry
              console.log(`Re-queued event ${queuedEvent.id}, attempt ${queuedEvent.retryCount + 1}`);
            } else {
              console.error(`Event ${queuedEvent.id} failed after 3 retries, dropping`);
            }

            return { success: false, eventId: queuedEvent.id, error };
          }
        })
      );

      const succeeded = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

      console.log(`Batch completed: ${succeeded} succeeded, ${failed} failed`);

    } catch (error) {
      console.error('Error in batch processing:', error);
    } finally {
      this.processing = false;
    }
  }

  // Get current queue status for monitoring
  getStatus(): { queueLength: number; processing: boolean; batchSize: number } {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      batchSize: this.BATCH_SIZE,
    };
  }
}

// Create and export the singleton instance
export const eventBatchProcessor = new EventBatchProcessor();

// Export for testing
export { EventBatchProcessor };