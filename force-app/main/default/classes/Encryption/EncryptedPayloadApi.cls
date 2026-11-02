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

  private interface ResourceHandler {
    Object fetchList();
    Object applyUpdate();
  }

  private class AccountHandler implements ResourceHandler {
    public Object fetchList() {
      return AccountApi.getAccounts();
    }
    public Object applyUpdate() {
      return AccountApi.updateAccount();
    }
  }

  private class ContactHandler implements ResourceHandler {
    public Object fetchList() {
      return ContactApi.getContacts();
    }
    public Object applyUpdate() {
      return ContactApi.updateContact();
    }
  }

  private class OpportunityHandler implements ResourceHandler {
    public Object fetchList() {
      return OpportunityApi.getOpportunities();
    }
    public Object applyUpdate() {
      return OpportunityApi.updateOpportunity();
    }
  }

  private static final Map<String, ResourceHandler> ROUTES = new Map<String, ResourceHandler>{
    'accounts' => new AccountHandler(),
    'contacts' => new ContactHandler(),
    'opportunities' => new OpportunityHandler()
  };

  private static final Pattern ROUTE_PATTERN = Pattern.compile(
    '^/services/apexrest/([a-zA-Z0-9]+)(?:/([a-zA-Z0-9]{15,18}))?$'
  );

  private static Object dispatch(String method, String path) {
    Matcher routeMatch = ROUTE_PATTERN.matcher(path);
    if (!routeMatch.matches()) {
      throw new RejectedException('Unsupported route.');
    }

    ResourceHandler handler = ROUTES.get(routeMatch.group(1));
    String recordId = routeMatch.group(2);
    if (handler == null) {
      throw new RejectedException('Unsupported route.');
    }

    if (method == 'GET' && recordId == null) {
      return handler.fetchList();
    }
    if (method == 'PATCH' && recordId != null) {
      return handler.applyUpdate();
    }
    throw new RejectedException('Unsupported route.');
  }
}
