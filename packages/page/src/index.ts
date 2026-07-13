/**
 * npm org landing package — lists published siblings.
 * Consumers install scoped packages (e.g. @page-component-object/react), not this meta package.
 */
export const scope = '@page-component-object' as const;

export const packages = [
  '@page-component-object/core',
  '@page-component-object/queries',
  '@page-component-object/msw',
  '@page-component-object/react',
  '@page-component-object/router-react',
  '@page-component-object/preset-mui',
  '@page-component-object/adapter-vitest',
  '@page-component-object/adapter-jest',
  '@page-component-object/adapter-storybook',
  '@page-component-object/adapter-cypress',
] as const;

export type PackageName = (typeof packages)[number];
