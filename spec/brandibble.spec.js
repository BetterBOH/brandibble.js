/* global Brandibble expect it describe */
import { UnsecureApiKey } from './helpers';

// Brandibble Wrapper
describe('Brandibble', () => {
  it('exists', () => expect(Brandibble).to.exist);

  it('sets private variables', () => {
    expect(Brandibble).to.have.property('adapter');
    const adapter = Brandibble.adapter;
    expect(adapter).to.have.property('apiKey', UnsecureApiKey);
    expect(adapter).to.have.property(
      'apiEndpoint',
      'https://staging.brandibble.co/api/',
    );
    expect(adapter).to.have.property(
      'apiVersion',
      'v1',
    );
    expect(adapter).to.have.property(
      'brandId',
      6,
    );
  });

  describe('sendSupportTicket', () => {
    it('can create support ticket', () => {
      return Brandibble.sendSupportTicket({
        subject: 'help!',
        body: 'i need avocado!',
      }).then(response => expect(response).to.exist);
    });
  });

  describe('reset', () => {
    it('flushes the adapter and re-initializes stateful properties', () => {
      return Brandibble.reset().then(() => {
        expect(Brandibble.adapter.currentOrder).to.be.null;
        expect(Brandibble.events._callStack).to.be.empty;
      });
    });
  });
});
