(function() {
    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again,
     * it will do nothing next time.
     */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  function calculate() {
    // Check for listings
    const listings = document.getElementsByClassName("sc-1tt2vbg-3 eFJncP");

    if (listings.length > 0) {
      for (let i = 0; i < listings.length; i++) {
        const listing = listings[i];
        const observer = new MutationObserver((records, observer) => {
          calculateListings([listing,]);
        });
        observer.observe(listing, {childList: true, subtree: true});
      }
    } else {
      const observer = new MutationObserver((records, observer) => {
        // Look for data in details page
        const priceElement = document.getElementsByClassName("price-value")[0];
        if (priceElement.children[0].children[0].textContent.indexOf("/m²") > -1) {
            return;
        }
        const price = priceElement.children[0].children[0].textContent.trim().replace(/\D/g, '');

        const areaIcon = document.getElementsByClassName("icon-scubierta")[0];
        const m2Size = areaIcon.parentElement.textContent.trim().replace(/\D/g, '');
        
        const pricePerM2 = parseInt(price) / m2Size;

        priceElement.children[0].children[0].textContent += " (" + formatter.format(pricePerM2) + "/m²)";
      });

      observer.observe(document, {childList: true, subtree: true});
    }
  }
      

  function calculateListings(listings) {
    for (let i = 0; i < listings.length; i++) {
      let currentElement = listings[i];

      // Look for price
      let priceElement = currentElement.getElementsByClassName("sc-12dh9kl-4 hbUMaO");

      if (priceElement.length !== 1 || priceElement[0].textContent.indexOf("/m²") > -1) {
          continue;
      }

      // Look for size
      let sizeElement = currentElement.getElementsByClassName("sc-1uhtbxc-1 dRoEma");

      if (sizeElement.length !== 1) {
          continue;
      }

      // Get parent element
      let parent = sizeElement[0].parentElement;
      
      // Get m2 size
      let m2Size = parent.getElementsByTagName("span")[0];

      // Pick just the numeric part
      m2Size = m2Size.textContent.trim().split(" ")[0];
  
      // Pick the first element if available
      priceElement = priceElement[0];

      let price = priceElement.textContent.trim().split(" ")[1];
      price = price.replace(/\D/g, '');

      let pricePerM2 = parseInt(price) / m2Size;

      priceElement.textContent = priceElement.textContent + " (" + formatter.format(pricePerM2) + "/m²)";
    }
  }

  function logChanges(records, observer) {
    for (const record of records) {
      for (const addedNode of record.addedNodes) {
        alert(`Added: ${addedNode.textContent}\n${log.textContent}`);
      }
      for (const removedNode of record.removedNodes) {
        alert(`Removed: ${removedNode.textContent}\n${log.textContent}`);
      }
      // if (record.target.childNodes.length === 0) {
      //   alert(`Disconnected\n${log.textContent}`);
      //   observer.disconnect();
      // }
      alert(record.target.childNodes.length);
    }
    alert(observer);
  }

  /**
   * Listen for messages from the background script.
   */
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "calculate") {
      calculate();
    }
  });
  
})();