export function getKeyName(...args: string[]) {
  return `bites:${args.join(":")}`;
}


export const restaurantKeyById = (id: string) => getKeyName("restaurant", id);
export const cuisineKeyById = (id: string) => getKeyName("cuisine", id);
export const reviewKeyById = (id: string) => getKeyName("review", id);
export const userKeyById = (id: string) => getKeyName("user", id);