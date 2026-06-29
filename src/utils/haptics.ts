/**
 * Browser-based haptic vibration feedback utility.
 * Falls back gracefully on desktop and unsupported devices.
 */
export function triggerHaptic(type: "light" | "medium" | "success" | "warning" | "error" = "light") {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      switch (type) {
        case "light":
          // Soft tactile tap for primary button clicks
          navigator.vibrate(12);
          break;
        case "medium":
          // Slightly stronger tap for menu navigation and toggles
          navigator.vibrate(22);
          break;
        case "success":
          // Dynamic double pulse for orders placed or invoice paid
          navigator.vibrate([15, 60, 15]);
          break;
        case "warning":
          // Long warning vibration
          navigator.vibrate([30, 80, 30]);
          break;
        case "error":
          // Double buzz for inputs error or missing details
          navigator.vibrate([60, 120, 60]);
          break;
      }
    } catch (e) {
      // Gracefully capture and ignore security or hardware exceptions
    }
  }
}
