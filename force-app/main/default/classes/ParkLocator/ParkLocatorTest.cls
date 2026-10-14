@isTest
private class ParkLocatorTest {

    @isTest
    static void testCountry() {
        Test.setMock(WebServiceMock.class, new ParkServiceMock());

        String[] result = ParkLocator.country('United States');

        String[] expected = new String[]{
            'Yellowstone National Park',
            'Mackinac National Park',
            'Yosemite National Park'
        };

        System.assertEquals(expected, result, 'Parks returned should match the mock data');
    }
}