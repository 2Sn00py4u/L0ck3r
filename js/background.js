function sendNativeMessage(message){
    chrome.runtime.sendNativeMessage('com.native.locker', message, (response) => {
        console.log("Response: ",response);
    });
}

sendNativeMessage({text:"Hallo Python!"})