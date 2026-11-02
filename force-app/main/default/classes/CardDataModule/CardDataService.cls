public with sharing class CardDataService {
  private static final Set<String> SUPPORTED_OBJECTS = new Set<String>{
    'Account',
    'Opportunity'
  };

  @AuraEnabled(cacheable=true)
  public static List<CardRecord> getCards(String objectApiName) {
    if (!SUPPORTED_OBJECTS.contains(objectApiName)) {
      throw new AuraHandledException('Unsupported object: ' + objectApiName);
    }

    List<CardRecord> cards = new List<CardRecord>();
    if (objectApiName == 'Account') {
      for (Account acc : getAccounts()) {
        cards.add(toAccountCard(acc));
      }
    } else if (objectApiName == 'Opportunity') {
      for (Opportunity opp : getOpportunities()) {
        cards.add(toOpportunityCard(opp));
      }
    }
    return cards;
  }

  private static List<Account> getAccounts() {
    return [
      SELECT
        Id,
        Name,
        Industry,
        Type,
        AnnualRevenue,
        NumberOfEmployees,
        BillingCity
      FROM Account
      WITH USER_MODE
      LIMIT 20
    ];
  }

  private static List<Opportunity> getOpportunities() {
    return [
      SELECT Id, Name, StageName, Amount, CloseDate, Account.Name
      FROM Opportunity
      WITH USER_MODE
      LIMIT 20
    ];
  }

  private static CardRecord toAccountCard(Account acc) {
    CardRecord card = new CardRecord();
    card.recordId = acc.Id;
    card.title = acc.Name;
    card.fields = new List<CardField>{
      new CardField('Industry', acc.Industry),
      new CardField('Type', acc.Type),
      new CardField('Annual Revenue', formatNumber(acc.AnnualRevenue)),
      new CardField(
        'Employees',
        acc.NumberOfEmployees == null
          ? null
          : String.valueOf(acc.NumberOfEmployees)
      ),
      new CardField('Billing City', acc.BillingCity)
    };
    return card;
  }

  private static CardRecord toOpportunityCard(Opportunity opp) {
    CardRecord card = new CardRecord();
    card.recordId = opp.Id;
    card.title = opp.Name;
    card.fields = new List<CardField>{
      new CardField('Stage', opp.StageName),
      new CardField('Amount', formatNumber(opp.Amount)),
      new CardField('Close Date', formatDate(opp.CloseDate)),
      new CardField('Account', opp.Account != null ? opp.Account.Name : null)
    };
    return card;
  }

  private static String formatNumber(Decimal value) {
    return value == null ? null : value.format();
  }

  private static String formatDate(Date value) {
    return value == null ? null : value.format();
  }

  public class CardRecord {
    @AuraEnabled
    public String recordId;
    @AuraEnabled
    public String title;
    @AuraEnabled
    public List<CardField> fields;
  }

  public class CardField {
    @AuraEnabled
    public String label;
    @AuraEnabled
    public String value;

    public CardField(String label, String value) {
      this.label = label;
      this.value = value;
    }
  }
}
