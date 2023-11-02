export interface ProductModel {
  readonly name: string;
  readonly price: number;
  readonly featureValue: number;
  readonly ratingValue: number;
  readonly categoryId: string;
  readonly imageUrl: string;
  readonly id: string;
  readonly ratingCount: number;
  readonly storeIds: string[];
}
