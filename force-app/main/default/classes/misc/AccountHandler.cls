public with sharing class AccountHandler {
    public AccountHandler() {

    }

    public static Account insertNewAccount(String accountName) {
        try {
            Account newAccount = new Account(Name = accountName.trim());
            insert newAccount;
            return newAccount;
        } catch (Exception e) {
            System.debug('Error occurred while inserting account: ' + e.getMessage());
            return null;
        }
    }
}

