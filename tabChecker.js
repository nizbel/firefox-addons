function checkTab(tabId)
{
    browser.tabs.query({currentWindow: true})
        .then((tabs) => {
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i].id === tabId) {
                    if (tabs[i].url.indexOf("wimoveis.com.br") > -1) {
                        startCalculating(tabs[i]);
                    }
                }
            }
    })
}

function startCalculating(tab) {
    browser.tabs.sendMessage(tab.id, {
        command: "calculate"
      });
  }

  /**
   * Just log the error to the console.
   */
  function reportError(error) {
    console.error(`Could not calculate: ${error}`);
  }

browser.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    if (changeInfo.status == "complete") {
        checkTab(tabId);
    }
});
