import './index.css'
import { Sortable } from '@shopify/draggable';
import {
  waitForElement,
  initializeAccountOrders,
  getOrderOfElements,
} from './utils';

(async () => {
  try {
    let saveOrder = true;
    const containerSelector = '[data-testid="account-list"]';
    await waitForElement(containerSelector);

    const containers = document.querySelectorAll(containerSelector);
    if (containers.length === 0) {
      return;
    }

    const searchBox = document.querySelector('[data-testid="list-header-text-filter"] input');
    if (searchBox) {
      (searchBox as Element).addEventListener('input', (event: any) => {
        const value = event.target.value;
        saveOrder = !value;
        if (!value) {
          initializeAccountOrders(containers);
        }
      });
    }

    await initializeAccountOrders(containers);

    const sortable = new Sortable(containers, {
      draggable: 'div.aws-sso-item',
      handle: 'div.aws-sso-item-handle',
      mirror: {
        appendTo: containers[0] as HTMLElement,
        constrainDimensions: true,
      },
    });
    sortable.on('drag:stop', () => {
      if (saveOrder) {
        getOrderOfElements(containers)
      }
    });
  } catch(error) {
    console.error(error);
  }
})();
