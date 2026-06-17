type Constructor<T> = new (...args: never[]) => T;

export type ListMapFunction<T extends ObjectFactory<object, object>> = (
  factory: T,
  index: number,
) => T;

export default class ObjectFactory<T extends object, Built = T> {
  protected item: T;

  constructor(input: Constructor<T> | T, ...args: never[]) {
    if (typeof input === 'function') {
      this.item = new input(...args);
    } else {
      this.item = { ...input };
    }
  }

  get instance(): T {
    return this.item;
  }

  setProps(props: Partial<T>): this {
    Object.assign(this.item, props);
    return this;
  }

  build(): Readonly<Built> {
    return Object.freeze({ ...this.item }) as Built;
  }

  static list<
    T extends object,
    Built = T,
    FactoryType extends ObjectFactory<T, Built> = ObjectFactory<T, Built>,
  >(
    this: new (input: Constructor<T> | T, ...args: never[]) => FactoryType,
    length: number,
    instantiate: (index: number) => FactoryType,
    mapFunction?: ListMapFunction<FactoryType>,
  ): Readonly<Built>[] {
    return Array.from({ length }, (_, index) => {
      const baseFactory = instantiate(index);
      if (mapFunction) {
        return mapFunction(baseFactory, index).build();
      }
      return baseFactory.build();
    });
  }

  static randomNumber(min = 0, max = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
