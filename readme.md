
// Function to send a message to the native messaging host and wait for a response
function sendMessageToHost(message) {
  return new Promise((resolve, reject) => {
    // Open the native messaging host
    const port = chrome.runtime.connectNative('your_native_host');

    // Listen for messages from the native messaging host
    port.onMessage.addListener((response) => {
      // Resolve the promise with the response from the host
      resolve(response);
    });

    // Handle errors
    port.onDisconnect.addListener(() => {
      reject(new Error('Failed to communicate with native messaging host.'));
    });

    // Send the message to the host
    port.postMessage(message);
  });
}

// Usage: Call sendMessageToHost and wait for the response
async function handleRequest() {
  try {
    const response = await sendMessageToHost({ action: 'processData' });
    console.log('Received response:', response);
    // Continue processing with the response
  } catch (error) {
    console.error('Error communicating with host:', error);
  }
}
