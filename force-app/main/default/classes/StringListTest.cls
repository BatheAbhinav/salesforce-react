public with sharing class StringListTest {
    public StringListTest() {
        System.debug('StringListTest constructor called');
    }

    public static List<String> generateStringList(Integer n){
        List<String> stringList = new List<String>();
        for(Integer i=0; i<n; i++){
            stringList.add('Test ' + i);
        }
        return stringList;
    }
}