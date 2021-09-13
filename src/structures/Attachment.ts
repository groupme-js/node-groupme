export default abstract class Attachment {
    type: string;
    constructor(type: string) {
        this.type = type;
    }
}

export class ImageAttachment extends Attachment {
    type = "image";
    url: string;
    constructor(data: Omit<ImageAttachment, keyof Attachment>) {
        super("image");
        this.url = data.url;
    }
}

export class LocationAttachment extends Attachment {
    type = "location";
    lat: string;
    lng: string;
    name: string;
    constructor(data: Omit<LocationAttachment, keyof Attachment>) {
        super("location");
        this.lat = data.lat;
        this.lng = data.lng;
        this.name = data.name;
    }
}

export class SplitAttachment extends Attachment {
    type = "split";
    token: string;
    constructor(data: Omit<SplitAttachment, keyof Attachment>) {
        super("split");
        this.token = data.token;
    }
}

export class EmojiAttachment extends Attachment {
    type = "emoji";
    placeholder: string;
    charmap: [number, number][];
    constructor(data: Omit<EmojiAttachment, keyof Attachment>) {
        super("emoji");
        this.placeholder = data.placeholder;
        this.charmap = data.charmap;
    }
}