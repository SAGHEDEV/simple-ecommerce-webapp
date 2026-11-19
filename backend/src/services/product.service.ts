import { HttpError } from "../utils/httpError";

// Product data comes from the free DummyJSON API (https://dummyjson.com) – no key, no admin needed.
const GROUPS: Record<string, string[]> = {
  Furniture: ["furniture"],
  "Home Decor": ["home-decoration"],
  Kitchen: ["kitchen-accessories"],
  Clothing: ["mens-shirts", "tops", "womens-dresses"],
  Accessories: ["womens-bags", "sunglasses", "womens-watches", "mens-watches", "womens-jewellery"],
};
export const CATEGORIES = Object.keys(GROUPS);

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice: number | null;
  discountPercentage: number;
  category: string;
  brand: string;
  thumbnail: string;
  images: string[];
  stock: number;
  rating: number;
  isNew: boolean;
}

export interface ProductQuery {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

let cache: { at: number; items: Product[] } | null = null;
const TTL = 60 * 60 * 1000;

async function fetchCategory(group: string, slug: string): Promise<Product[]> {
  const res = await fetch(`https://dummyjson.com/products/category/${slug}?limit=100`);
  if (!res.ok) throw new Error(`DummyJSON responded ${res.status}`);
  const data = (await res.json()) as { products: any[] };
  return data.products.map((p) => {
    const disc = Math.round(p.discountPercentage ?? 0);
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      price: p.price,
      originalPrice: disc >= 5 ? Math.round((p.price / (1 - disc / 100)) * 100) / 100 : null,
      discountPercentage: disc >= 5 ? disc : 0,
      category: group,
      brand: p.brand ?? "",
      thumbnail: p.thumbnail,
      images: p.images?.length ? p.images : [p.thumbnail],
      stock: p.stock ?? 0,
      rating: p.rating ?? 0,
      isNew: p.id % 5 === 0,
    };
  });
}

async function fetchCatalog(): Promise<Product[]> {
  const jobs = Object.entries(GROUPS).flatMap(([group, slugs]) => slugs.map((slug) => fetchCategory(group, slug)));
  return (await Promise.all(jobs)).flat();
}

export async function getAllProducts(): Promise<Product[]> {
  if (cache && Date.now() - cache.at < TTL) return cache.items;
  try {
    cache = { at: Date.now(), items: await fetchCatalog() };
  } catch (err) {
    if (!cache) throw err; // serve stale data if refresh fails
  }
  return cache!.items;
}

export async function listProducts(q: ProductQuery) {
  const search = (q.search ?? "").trim().toLowerCase();
  const page = Math.max(1, q.page || 1);
  const limit = Math.min(48, Math.max(1, q.limit || 12));

  let items = await getAllProducts();
  if (q.category && q.category !== "All") items = items.filter((p) => p.category === q.category);
  if (search) items = items.filter((p) => `${p.title} ${p.brand} ${p.description}`.toLowerCase().includes(search));
  if (q.sort === "price-asc") items = [...items].sort((a, b) => a.price - b.price);
  if (q.sort === "price-desc") items = [...items].sort((a, b) => b.price - a.price);
  if (q.sort === "name") items = [...items].sort((a, b) => a.title.localeCompare(b.title));

  const total = items.length;
  return { products: items.slice((page - 1) * limit, page * limit), total, page, pages: Math.ceil(total / limit) };
}

export async function getProduct(id: number): Promise<Product> {
  const product = (await getAllProducts()).find((p) => p.id === id);
  if (!product) throw new HttpError(404, "Product not found");
  return product;
}
