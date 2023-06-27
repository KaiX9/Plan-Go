export interface Merged {
    date: Date
    items: SavedDetails[]
}

export interface SavedDetails {
    place_id: string
    name: string
    comment: string
}

export interface Itinerary {
    date: Date
    items: SavedDetails[]
    uuid: string
}

export interface ItiList {
    location: string
    startDate: Date
    endDate: Date
}