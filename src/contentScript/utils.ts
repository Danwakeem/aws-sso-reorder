export const HANDLE =
  '<div class="aws-sso-item-handle"><svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" viewBox="0 0 24 24"><path fill="currentColor" d="M20 9H4v2h16zM4 15h16v-2H4z"/></svg></div>'
export const STORAGE_KEY = 'aws-sso-order'

export function waitForElement(selector: string) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector))
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect()
        resolve(document.querySelector(selector))
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })
}

export async function initializeAccountOrders(containers: NodeListOf<Element>) {
  const { [STORAGE_KEY]: accountIds = [] } = (await chrome.storage.local.get(STORAGE_KEY)) || {
    [STORAGE_KEY]: [],
  }
  const [container] = containers
  const elementMap: Record<string, Element> = {}

  // Add class selectors and parse out account ids
  for (const child of container.childNodes) {
    ;(child as Element).classList.add('aws-sso-item')
    const title = (child as Element).querySelector('button div > div')
    const handle = (child as Element).querySelector('.aws-sso-item-handle-container')
    if (title && !handle) {
      ;(title as Element).classList.add('aws-sso-item-handle-container')
      const originalContent = (title as Element).innerHTML
      ;(title as Element).innerHTML = HANDLE + originalContent
    }
    const accountThing = (child as Element).querySelector('button div > div:nth-of-type(2) ')
    if (!accountThing) {
      continue
    }
    const accountId = accountThing.textContent?.split('  |  ')?.[0] || ''
    ;(child as any).dataset.accountId = accountId
    elementMap[accountId] = child as Element
  }

  // Reorder elements
  for (const accountId of accountIds) {
    if (elementMap[accountId]) {
      container.appendChild(elementMap[accountId])
      delete elementMap[accountId]
    }
  }
  // Place elements that may not have been identified in our map
  for (const element of Object.values(elementMap)) {
    container.appendChild(element)
  }
}

export async function getOrderOfElements(containers: NodeListOf<Element>) {
  const [container] = containers
  const orderOfIds = []
  for (const child of container.childNodes) {
    orderOfIds.push((child as any).dataset.accountId)
  }
  await chrome.storage.local.set({ [STORAGE_KEY]: orderOfIds })
}
