export type Cart = {
  userId: string;
  items: CartItem[];
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  imageString: string;
  size?: string;
  color?: string;
};
