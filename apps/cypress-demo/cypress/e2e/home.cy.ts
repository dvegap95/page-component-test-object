import { setupPCOCypress } from '@pco/adapter-cypress';
import { CatalogHomeCypressTestObject } from '@pco/demo-shared/cypress-objects';
import { CatalogHomeStoryTestObject } from '@pco/demo-shared/story-objects';

setupPCOCypress({ resetUserAgentEachTest: false });

function bindView() {
  return cy.document().then((doc) => {
    const view = new CatalogHomeStoryTestObject();
    view.bindToRoot(doc.body);
    return view;
  });
}

function bindCypressView() {
  return cy.document().then((doc) => {
    const view = new CatalogHomeCypressTestObject();
    view.bindToRoot(doc.body);
    return view;
  });
}

describe('Catalog home (E2E + PCO)', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('lists items using TestObject getters', () => {
    cy.get('h1').should('contain', 'Items');

    bindView().then((view) => {
      expect(view.heading).to.exist;
      expect(view.itemLinks).to.have.length(3);
    });
  });

  it('navigates using TestObject getters with Cypress click', () => {
    cy.get('h1').should('contain', 'Items');

    bindView().then((view) => cy.wrap(view.itemLinks[0]).click());

    cy.url().should('include', '/items/1');
  });

  it('uses native Cypress chains on PCOChainable getters', () => {
    bindCypressView().then((view) => {
      view.heading.should('contain.text', 'Items');
      view.firstItemLink.should('be.visible');
    });
  });

  it('navigates using semantic userClick on PCOChainable', () => {
    bindCypressView().then((view) => {
      view.firstItemLink.userClick();
    });

    cy.url().should('include', '/items/1');
  });

  it('selects an option using semantic selectOptionByText on PCOChainable', () => {
    bindCypressView().then((view) => {
      view.demoSelect.selectOptionByText('Option B');
      view.selectedStatus.should('contain.text', 'Option B');
    });
  });
});
