@isTest
public class AnimalLocatorMock implements HttpCalloutMock {
    public HTTPResponse respond(HTTPRequest req) {
        HTTPResponse response =  new HTTPResponse();
        response.setHeader('Content-Type', 'application/json');
        response.setBody('{"animal":{"id":1,"name":"chicken","eats":"chicken food","says":"cluck cluck"}}');
        response.setStatusCode(200);
        return response;
    }
}