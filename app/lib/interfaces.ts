export type Cart = {
  userId: string;
  items: CartItem[];
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageString: string;
  size?: string;
  color?: string;
};
