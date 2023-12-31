export interface PlaceSearchResult {
    address: string;
    location?: google.maps.LatLng;
    imageUrl?: string;
    iconUrl?: string;
    name?: string;
}

export interface Place {
    types: any;
    place_id: string;
    name: string;
}

export interface PlaceWithTypes extends Place {
    types: string[];
}

export interface DateWithItems {
    date: Date;
    items: Place[];
}