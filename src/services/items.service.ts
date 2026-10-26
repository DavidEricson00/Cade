import { items } from "../data/items";
import { Item } from "../types/item";

export function getAllItems() {
    return items;
}

export function getItemById(id: string) {
    return items.find((item) => item.id === id);
}

export function createItem(item: Item) {
    items.push(item);
    return item;
}

export function updateItem(id: string, data: Partial<Omit<Item, 'id'>>) {
    const item = items.find((item) => item.id === id);

    if (!item) {
        return undefined;
    }

    Object.assign(item, data);
    return item;
}

export function deleteItem(id: string) {
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
        return false;
    }

    items.splice(index, 1);
    return true;
}