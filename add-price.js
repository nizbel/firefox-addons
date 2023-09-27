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
    const listingsContainer = document.getElementsByClassName("postings-container");

    if (listingsContainer.length > 0) {
      const observer = new MutationObserver((records, observer) => {
        calculateListings(listingsContainer[0].getElementsByClassName("sc-1tt2vbg-3 eFJncP"));
      });
      observer.observe(listingsContainer[0], {childList: true, subtree: true});
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

      // Check if property or development
      if (checkIfProperty(currentElement)) {
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
      } else {
        // Is development
        // Look for price
        let priceElements = currentElement.getElementsByClassName("price");

        if (priceElements.length < 1 || priceElements[0].textContent.indexOf("/m²") > -1) {
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
        let m2Sizes = parent.getElementsByTagName("span")[0];

        // Pick just the numeric parts
        m2Sizes = m2Sizes.textContent.trim().split(" ");
        let sizes = [];
        for (let i = 0; i < m2Sizes.length; i++) {
          const replacedString = m2Sizes[i].replace(/\D/g, '');
          if (replacedString.length > 0) {
            sizes.push(replacedString);
          }
        }
    
        // Pick price elements
        for (let i = 0; i < priceElements.length; i++) {
          let priceElement = priceElements[i];

          let price = priceElement.textContent.trim().split(" ")[1];
          price = price.replace(/\D/g, '');

          let pricePerM2 = parseInt(price) / sizes[i];

          priceElement.appendChild(createDevelopmentPriceM2Element(pricePerM2));
        }
      }
    }
  }

  function createDevelopmentPriceM2Element(price) {
    const priceM2Element = document.createElement("span");
    priceM2Element.classList.add("jneaYd");
    priceM2Element.style.color = 'black';
    priceM2Element.style.fontSize = '16px';
    priceM2Element.textContent = `(${formatter.format(price)}/m²)`;

    return priceM2Element;
  }

  function checkIfProperty(listing) {
    return listing.getElementsByClassName("sc-i1odl-0 crUUno").length > 0;
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