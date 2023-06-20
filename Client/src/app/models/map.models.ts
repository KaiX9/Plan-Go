export interface PlaceSearchResult {
    address: string
    location?: google.maps.LatLng
    imageUrl?: string
    iconUrl?: string
    name?: string
}

export interface Place {
    place_id: string
    name: string
}

export interface DateWithItems {
    date: Date
    items: Place[]
}