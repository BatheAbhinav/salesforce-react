import { createElement } from '@lwc/engine-dom';
import CrmData1 from 'c/crmData1';
import getCards from '@salesforce/apex/CardDataService.getCards';
import mockGetCards from './data/getCards.json';

jest.mock(
    '@salesforce/apex/CardDataService.getCards',
    () => {
        const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
        return {
            default: createApexTestWireAdapter(jest.fn())
        };
    },
    { virtual: true }
);

describe('c-crm-data1', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('renders a card per record returned by the wire adapter', () => {
        const element = createElement('c-crm-data1', { is: CrmData1 });
        element.objectApiName = 'Account';
        document.body.appendChild(element);

        getCards.emit(mockGetCards);

        return Promise.resolve().then(() => {
            const cards = element.shadowRoot.querySelectorAll('article.slds-card');
            expect(cards.length).toBe(mockGetCards.length);
            const firstTitle = cards[0].querySelector('h3.slds-card__header-title');
            expect(firstTitle.textContent).toBe(mockGetCards[0].title);
        });
    });

    it('renders field label/value pairs for each card without any object-specific logic', () => {
        const element = createElement('c-crm-data1', { is: CrmData1 });
        element.objectApiName = 'Account';
        document.body.appendChild(element);

        getCards.emit(mockGetCards);

        return Promise.resolve().then(() => {
            const firstCard = element.shadowRoot.querySelector('article.slds-card');
            const dts = firstCard.querySelectorAll('dt');
            const dds = firstCard.querySelectorAll('dd');
            expect(dts.length).toBe(mockGetCards[0].fields.length);
            expect(dts[0].textContent).toBe(mockGetCards[0].fields[0].label);
            expect(dds[0].textContent).toBe(mockGetCards[0].fields[0].value);
        });
    });

    it('shows an empty state when no records are returned', () => {
        const element = createElement('c-crm-data1', { is: CrmData1 });
        element.objectApiName = 'Opportunity';
        document.body.appendChild(element);

        getCards.emit([]);

        return Promise.resolve().then(() => {
            const emptyState = element.shadowRoot.querySelector('.slds-text-color_weak');
            expect(emptyState).not.toBeNull();
            expect(emptyState.textContent).toBe('No records found.');
        });
    });

    it('shows an error message when the wire adapter errors', () => {
        const element = createElement('c-crm-data1', { is: CrmData1 });
        element.objectApiName = 'Account';
        document.body.appendChild(element);

        getCards.error({ message: 'Unsupported object: Lead' });

        return Promise.resolve().then(() => {
            const errorEl = element.shadowRoot.querySelector('.slds-text-color_error');
            expect(errorEl.textContent).toBe('Unsupported object: Lead');
        });
    });
});
