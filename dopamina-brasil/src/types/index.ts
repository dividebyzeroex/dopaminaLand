export interface Product {
  id: string | number;
  slug: string;
  name?: string;
  shortName: string;
  category: string;
  salePrice: number;
  image?: string; // Emoji fallback
  localImage?: string; // Supabase / Web URL
  tag?: string;
  originalPrice?: number;
  price?: number;
  rating?: number | string;
  reviews?: number;
  badge?: string;
  discount?: number;
  description?: string;
  gradient?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
