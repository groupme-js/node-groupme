export interface Attachment {
    type: string
}

export class ImageAttachment implements Attachment {
    type = "image";
    url: string;
    constructor(data: Omit<ImageAttachment, keyof Attachment>) {
        this.url = data.url;
    }
}

export class LocationAttachment implements Attachment {
    type = "location";
    lat: string;
    lng: string;
    name: string;
    constructor(data: Omit<LocationAttachment, keyof Attachment>) {
        this.lat = data.lat;
        this.lng = data.lng;
        this.name = data.name;
    }
}

export class SplitAttachment implements Attachment {
    type = "split";
    token: string;
    constructor(data: Omit<SplitAttachment, keyof Attachment>) {
        this.token = data.token;
    }
}

export class EmojiAttachment implements Attachment {
    type = "emoji";
    placeholder: string;
    charmap: [number, number][];
    constructor(data: Omit<EmojiAttachment, keyof Attachment>) {
        this.placeholder = data.placeholder;
        this.charmap = data.charmap;
    }
}