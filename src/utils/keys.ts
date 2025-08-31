export function getKeyName(...args: string[]) {
  return `bites:${args.join(":")}`;
}


export const restaurantKeyById = (id: string) => getKeyName("restaurant", id);
export const reviewKeyById = (id: string) => getKeyName("reviews", id);
export const reviewDetailsKeyById = (id: string) => getKeyName("review_details", id)

// export const cuisineKeyById = (id: string) => getKeyName("cuisine", id);