export type CheckoutItem = {
  productId: string;
  colour: string;
  size: string;
  quantity: number;
  madeToMeasure?: boolean;
};

export type CheckoutResponse = { url: string; mode: 'stripe' | 'mock' } | { error: string };
