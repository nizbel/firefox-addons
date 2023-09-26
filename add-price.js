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
        // Pick listings
        const elements = document.getElementsByClassName("sc-1tt2vbg-3 eFJncP");

        for (let i = 0; i < elements.length; i++) {
            let currentElement = elements[i];

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
        
            // Look for price
            let priceElement = currentElement.getElementsByClassName("sc-12dh9kl-4 hbUMaO");

            if (priceElement.length !== 1) {
                continue;
            }

            // Pick the first element if available
            priceElement = priceElement[0];

            let price = priceElement.textContent.trim().split(" ")[1];
            price = price.replace(/\D/g, '');

            let pricePerM2 = parseInt(price) / m2Size;

            priceElement.textContent = priceElement.textContent + " (" + formatter.format(pricePerM2) + "/m²)";
        }
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