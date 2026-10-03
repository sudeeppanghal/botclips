/**
 * High-Precision Live Delivery & Jitter Progress Calculator for BotClips
 * Handles Whop Clipper micro-batches, non-linear jitter curves, and standard SMM orders.
 */

export interface OrderProgressResult {
  total: number;
  delivered: number;
  remains: number;
  progressPct: number;
  batchInfo: string | null;
  totalBatches: number;
  completedBatches: number;
  runningBatchNum: number | null;
  isJitter: boolean;
  isPaused: boolean;
  isCancelled: boolean;
  isCompleted: boolean;
  statusUpper: string;
}

export function computeOrderProgress(order: any): OrderProgressResult {
  const total = Math.max(1, Number(order.quantity || 1));
  const statusUpper = String(order.status || "PENDING").toUpperCase();
  let delivered = 0;
  let batchInfo: string | null = null;
  let totalBatches = 0;
  let completedBatches = 0;
  let runningBatchNum: number | null = null;
  let isJitter = false;
  let isPaused = statusUpper === "PAUSED";
  let isCancelled = statusUpper === "CANCELLED" || statusUpper === "REFUNDED";

  if (order.comboData) {
    try {
      const combo = typeof order.comboData === "string" ? JSON.parse(order.comboData) : order.comboData;
      if (combo && Array.isArray(combo.batches) && combo.batches.length > 0) {
        isJitter = true;
        totalBatches = combo.batches.length;
        if (combo.isPaused) isPaused = true;
        if (combo.isCancelled) isCancelled = true;

        let batchDelivered = 0;
        combo.batches.forEach((b: any, index: number) => {
          const bQty = Number(b.views || b.quantity || 0);
          const bStatus = String(b.status || "").toUpperCase();

          if (bStatus === "COMPLETED") {
            batchDelivered += bQty;
            completedBatches++;
          } else if (bStatus === "DISPATCHED") {
            batchDelivered += bQty;
            if (runningBatchNum === null) {
              runningBatchNum = b.batchNumber || index + 1;
            }
          }
        });

        if (statusUpper === "COMPLETED") {
          delivered = total;
          completedBatches = totalBatches;
        } else {
          delivered = Math.min(total, batchDelivered);
        }

        if (runningBatchNum !== null) {
          batchInfo = `Pulse #${runningBatchNum} of ${totalBatches}`;
        } else if (completedBatches > 0) {
          batchInfo = `${completedBatches}/${totalBatches} pulses`;
        } else {
          batchInfo = `${totalBatches} pulses scheduled`;
        }
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback for standard single orders (or synced orders)
  if (!isJitter) {
    if (statusUpper === "COMPLETED") {
      delivered = total;
    } else if (order.remains !== undefined && order.remains !== null && !isNaN(Number(order.remains))) {
      const remains = Number(order.remains);
      delivered = Math.max(0, Math.min(total, total - remains));
    } else if (statusUpper === "IN_PROGRESS" || statusUpper === "PROCESSING") {
      delivered = 0;
    }
  }

  const rawPct = total > 0 ? Math.round((delivered / total) * 100) : 0;
  const progressPct = statusUpper === "COMPLETED" ? 100 : Math.max(0, Math.min(99, rawPct));

  return {
    total,
    delivered,
    remains: Math.max(0, total - delivered),
    progressPct,
    batchInfo,
    totalBatches,
    completedBatches,
    runningBatchNum,
    isJitter,
    isPaused,
    isCancelled,
    isCompleted: statusUpper === "COMPLETED" || progressPct >= 100,
    statusUpper,
  };
}
