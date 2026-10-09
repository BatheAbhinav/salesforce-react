@isTest
private class TestVerifyDate {

  // date2 is after date1 and within 30 days -> returns date2
  @isTest
  static void testDate2WithinNext30Days() {
    Date date1 = Date.newInstance(2026, 10, 8);
    Date date2 = Date.newInstance(2026, 10, 20);

    Test.startTest();
    Date result = VerifyDate.CheckDates(date1, date2);
    Test.stopTest();

    System.assertEquals(date2, result, 'Date2 within 30 days should be returned');
  }

  // date2 equals date1 -> not in the past, within range -> returns date2
  @isTest
  static void testDate2SameAsDate1() {
    Date date1 = Date.newInstance(2026, 10, 8);
    Date date2 = Date.newInstance(2026, 10, 8);

    Date result = VerifyDate.CheckDates(date1, date2);

    System.assertEquals(date2, result, 'Same date should return date2');
  }

  // boundary: date2 is 29 days after date1 -> still within range
  @isTest
  static void testDate2On29thDay() {
    Date date1 = Date.newInstance(2026, 10, 8);
    Date date2 = date1.addDays(29);

    Date result = VerifyDate.CheckDates(date1, date2);

    System.assertEquals(date2, result, '29 days out should return date2');
  }

  // boundary: date2 is exactly 30 days after date1 -> out of range, end of month
  @isTest
  static void testDate2Exactly30DaysAway() {
    Date date1 = Date.newInstance(2026, 10, 8);
    Date date2 = date1.addDays(30);

    Date result = VerifyDate.CheckDates(date1, date2);

    System.assertEquals(Date.newInstance(2026, 10, 31), result,
      'Exactly 30 days should return end of date1 month');
  }

  // date2 is more than 30 days after date1 -> end of month
  @isTest
  static void testDate2MoreThan30DaysAway() {
    Date date1 = Date.newInstance(2026, 10, 8);
    Date date2 = Date.newInstance(2026, 12, 25);

    Date result = VerifyDate.CheckDates(date1, date2);

    System.assertEquals(Date.newInstance(2026, 10, 31), result,
      'Date2 beyond 30 days should return end of date1 month');
  }

  // date2 is before date1 -> end of month
  @isTest
  static void testDate2InThePast() {
    Date date1 = Date.newInstance(2026, 10, 8);
    Date date2 = Date.newInstance(2026, 10, 1);

    Date result = VerifyDate.CheckDates(date1, date2);

    System.assertEquals(Date.newInstance(2026, 10, 31), result,
      'Past date2 should return end of date1 month');
  }

  // end of month: 30-day month
  @isTest
  static void testEndOfMonthThirtyDayMonth() {
    Date date1 = Date.newInstance(2026, 11, 10);
    Date date2 = Date.newInstance(2026, 9, 1);

    Date result = VerifyDate.CheckDates(date1, date2);

    System.assertEquals(Date.newInstance(2026, 11, 30), result);
  }

  // end of month: February in a non-leap year
  @isTest
  static void testEndOfMonthFebruaryNonLeapYear() {
    Date date1 = Date.newInstance(2026, 2, 5);
    Date date2 = Date.newInstance(2026, 6, 1);

    Date result = VerifyDate.CheckDates(date1, date2);

    System.assertEquals(Date.newInstance(2026, 2, 28), result);
  }

  // end of month: February in a leap year
  @isTest
  static void testEndOfMonthFebruaryLeapYear() {
    Date date1 = Date.newInstance(2028, 2, 5);
    Date date2 = Date.newInstance(2028, 6, 1);

    Date result = VerifyDate.CheckDates(date1, date2);

    System.assertEquals(Date.newInstance(2028, 2, 29), result);
  }

  // within 30 days but crossing into the next month/year -> returns date2
  @isTest
  static void testDate2WithinRangeAcrossYearBoundary() {
    Date date1 = Date.newInstance(2026, 12, 20);
    Date date2 = Date.newInstance(2027, 1, 5);

    Date result = VerifyDate.CheckDates(date1, date2);

    System.assertEquals(date2, result, 'Should return date2 across year boundary');
  }

  // end of month in December
  @isTest
  static void testEndOfMonthDecember() {
    Date date1 = Date.newInstance(2026, 12, 15);
    Date date2 = Date.newInstance(2027, 3, 1);

    Date result = VerifyDate.CheckDates(date1, date2);

    System.assertEquals(Date.newInstance(2026, 12, 31), result);
  }
}