import { setupPCOCypress } from '@page-component-object/adapter-cypress';
import { CatalogHomeTestObject } from '@page-component-object/demo-shared/story-objects';

setupPCOCypress({ resetUserAgentEachTest: false });

function bindView() {
  return cy.document().then((doc) => {
    const view = new CatalogHomeTestObject();
    view.bindResolver(() => doc.body);
    return view;
  });
}

describe('Catalog home (E2E + PCO)', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('lists items using unified TestObject getters', () => {
    bindView().then((view) => {
      view.heading.should('contain.text', 'Items');
      cy.findAllByRole('link').should('have.length', 3);
    });
  });

  it('navigates using chainable click on firstItemLink', () => {
    bindView().then((view) => {
      view.firstItemLink.click();
    });

    cy.url().should('include', '/items/1');
  });

  it('uses native Cypress chains on PCOChainable getters', () => {
    bindView().then((view) => {
      view.heading.should('contain.text', 'Items');
      view.firstItemLink.should('be.visible');
    });
  });

  it('navigates using semantic userClick on PCOChainable', () => {
    bindView().then((view) => {
      view.firstItemLink.userClick();
    });

    cy.url().should('include', '/items/1');
  });

  it('selects an option using semantic selectOptionByText on PCOChainable', () => {
    bindView().then((view) => {
      view.demoSelect.selectOptionByText('Option B');
      view.selectedStatus.should('contain.text', 'Option B');
    });
  });
});
