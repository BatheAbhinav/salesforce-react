@RestResource(urlMapping='/payload/*')
global with sharing class EncryptedPayloadApi {
  private static final Blob AAD = Blob.valueOf('apex-payload-v1');

  public class RejectedException extends Exception {
  }

  // Demo key: derived per user from the current session, so nothing is stored or shipped in the bundle.
  private static Blob sessionKey() {
    String sessionId = UserInfo.getSessionId();
    if (String.isBlank(sessionId) || UserInfo.getUserType() == 'Guest') {
      throw new RejectedException('No session.');
    }
    return Crypto.generateMac(
      'hmacSHA256',
      Blob.valueOf('payload-demo:' + UserInfo.getUserId()),
      Blob.valueOf(sessionId)
    );
  }

  @HttpGet
  global static void getKey() {
    RestResponse response = RestContext.response;
    response.addHeader('Cache-Control', 'no-store');
    response.addHeader('Content-Type', 'application/json');
    try {
      response.responseBody = Blob.valueOf(
        JSON.serialize(
          new Map<String, String>{
            'key' => EncodingUtil.base64Encode(sessionKey())
          }
        )
      );
    } catch (Exception failure) {
      fail(response, failure);
    }
  }

  @HttpPost
  global static void invoke() {
    RestResponse response = RestContext.response;
    response.addHeader('Cache-Control', 'no-store');
    response.addHeader('Content-Type', 'application/json');
    RestRequest originalRequest = RestContext.request;
    try {
      Blob key = sessionKey();
      Map<String, Object> envelope = (Map<String, Object>) JSON.deserializeUntyped(
        originalRequest.requestBody.toString()
      );
      Blob plain = Crypto.decryptWithManagedIV(
        'AES256-GCM',
        key,
        EncodingUtil.base64Decode((String) envelope.get('payload')),
        AAD
      );
      Map<String, Object> call = (Map<String, Object>) JSON.deserializeUntyped(
        plain.toString()
      );
      String method = (String) call.get('method');
      String path = (String) call.get('path');

      RestRequest dispatched = new RestRequest();
      dispatched.requestURI = path;
      dispatched.httpMethod = method;
      dispatched.requestBody = Blob.valueOf(JSON.serialize(call.get('body')));
      RestContext.request = dispatched;
      Object result = dispatch(method, path);

      Blob sealed = Crypto.encryptWithManagedIV(
        'AES256-GCM',
        key,
        Blob.valueOf(JSON.serialize(result)),
        AAD
      );
      response.responseBody = Blob.valueOf(
        JSON.serialize(
          new Map<String, String>{
            'payload' => EncodingUtil.base64Encode(sealed)
          }
        )
      );
    } catch (Exception failure) {
      fail(response, failure);
    } finally {
      RestContext.request = originalRequest;
    }
  }

  private static void fail(RestResponse response, Exception failure) {
    // Type and message only; never payloads or keys.
    System.debug(
      LoggingLevel.ERROR,
      'EncryptedPayloadApi failure: ' +
        failure.getTypeName() +
        ': ' +
        failure.getMessage()
    );
    response.statusCode = 400;
    response.responseBody = Blob.valueOf(
      '{"message":"Encrypted operation rejected."}'
    );
  }

  private static Object dispatch(String method, String path) {
    if (method == 'GET') {
      if (path == '/services/apexrest/accounts')
        return AccountApi.getAccounts();
      if (path == '/services/apexrest/contacts')
        return ContactApi.getContacts();
      if (path == '/services/apexrest/opportunities')
        return OpportunityApi.getOpportunities();
    }
    if (method == 'PATCH') {
      if (
        Pattern.matches(
          '^/services/apexrest/accounts/[a-zA-Z0-9]{15,18}$',
          path
        )
      )
        return AccountApi.updateAccount();
      if (
        Pattern.matches(
          '^/services/apexrest/contacts/[a-zA-Z0-9]{15,18}$',
          path
        )
      )
        return ContactApi.updateContact();
      if (
        Pattern.matches(
          '^/services/apexrest/opportunities/[a-zA-Z0-9]{15,18}$',
          path
        )
      )
        return OpportunityApi.updateOpportunity();
    }
    throw new RejectedException('Unsupported route.');
  }
}
