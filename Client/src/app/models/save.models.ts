export interface Merged {
    date: Date
    items: SavedDetails[]
}

export interface SavedDetails {
    place_id: string
    name: string
    comment: string
}