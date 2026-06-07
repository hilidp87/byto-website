export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
  category: string;
  brand?: string | null;
  material?: string | null;
}

export interface StyleItem {
  id: string;
  styleId: string;
  productId: string;
  hotspotX: number;
  hotspotY: number;
  product: Product;
}

export interface Style {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  bundleDiscount: number;
  season?: string | null;
  occasion?: string | null;
  items: StyleItem[];
}

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface WishlistEntry {
  productId: string;
  slug: string;
  title: string;
  image: string;
  price: number;
}

export interface OrderSummary {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    size?: string | null;
    color?: string | null;
    product: { title: string; slug: string; images: string[] };
  }[];
}
