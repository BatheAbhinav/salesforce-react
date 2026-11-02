import { LightningElement, api, wire } from 'lwc';
import getCards from '@salesforce/apex/CardDataService.getCards';

export default class CrmData1 extends LightningElement {
    @api objectApiName;
    @api cardTitle;
    @api iconName;

    @wire(getCards, { objectApiName: '$objectApiName' })
    cardsResult;

    get records() {
        return this.cardsResult?.data ?? [];
    }

    get hasRecords() {
        return this.records.length > 0;
    }

    get isLoading() {
        return !this.cardsResult;
    }

    get hasError() {
        return !!this.cardsResult?.error;
    }

    get errorMessage() {
        const error = this.cardsResult?.error;
        if (!error) {
            return '';
        }
        return error.body?.message || error.message || 'Unknown error';
    }

    get isEmpty() {
        return !this.isLoading && !this.hasError && !this.hasRecords;
    }
}
