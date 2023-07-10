export interface DayData {
    places: string[];
    comment: string;
}

export interface TransformedData {
    [key: string]: DayData;
}

export interface GuideData {
    uuid: string;
    title: string;
    summary: string;
    guideData: TransformedData;
    author?: string;
}