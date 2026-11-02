@isTest
private class CardDataServiceTest {
  @isTest
  static void testGetCardsForAccount() {
    Account acc = new Account(
      Name = 'Acme Corp',
      Industry = 'Technology',
      Type = 'Customer',
      AnnualRevenue = 1000000,
      NumberOfEmployees = 50,
      BillingCity = 'San Francisco'
    );
    insert acc;

    Test.startTest();
    List<CardDataService.CardRecord> cards = CardDataService.getCards('Account');
    Test.stopTest();

    System.assertEquals(1, cards.size());
    CardDataService.CardRecord card = cards[0];
    System.assertEquals(acc.Id, card.recordId);
    System.assertEquals('Acme Corp', card.title);
    System.assertEquals(5, card.fields.size());
    System.assertEquals('Industry', card.fields[0].label);
    System.assertEquals('Technology', card.fields[0].value);
    System.assertEquals('Employees', card.fields[3].label);
    System.assertEquals('50', card.fields[3].value);
  }

  @isTest
  static void testGetCardsForOpportunity() {
    Account acc = new Account(Name = 'Globex');
    insert acc;
    Opportunity opp = new Opportunity(
      Name = 'Big Deal',
      AccountId = acc.Id,
      StageName = 'Prospecting',
      Amount = 50000,
      CloseDate = Date.newInstance(2026, 12, 31)
    );
    insert opp;

    Test.startTest();
    List<CardDataService.CardRecord> cards = CardDataService.getCards('Opportunity');
    Test.stopTest();

    System.assertEquals(1, cards.size());
    CardDataService.CardRecord card = cards[0];
    System.assertEquals(opp.Id, card.recordId);
    System.assertEquals('Big Deal', card.title);
    System.assertEquals('Stage', card.fields[0].label);
    System.assertEquals('Prospecting', card.fields[0].value);
    System.assertEquals('Account', card.fields[3].label);
    System.assertEquals('Globex', card.fields[3].value);
  }

  @isTest
  static void testGetCardsRejectsUnsupportedObject() {
    Boolean caught = false;
    try {
      CardDataService.getCards('Lead');
    } catch (AuraHandledException e) {
      caught = true;
    }
    System.assertEquals(true, caught, 'Unsupported object types should throw AuraHandledException');
  }
}
