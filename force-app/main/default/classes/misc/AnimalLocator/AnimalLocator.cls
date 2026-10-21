public with sharing class AnimalLocator {
    public static String getAnimalNameById(Integer animalId) {
        Http http = new http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://th-apex-http-callout.herokuapp.com/animals/'+ animalId);
        request.setMethod('GET');
        HttpResponse response = http.send(request);
        String ans = '';
        if (response.getStatusCode() == 200) {
            Map<String, Object> results = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            System.debug('1. Animals list' + results.get('animal'));
            Map<String, Object> animal = (Map<String, Object>) results.get('animal');
            ans = (String) animal.get('name');
        }
        return ans;
    }
}