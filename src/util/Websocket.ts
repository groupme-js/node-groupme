import { ok } from "assert";
import EventEmitter from "events";
import WebSocket from "ws";
import type { Client } from "..";

export default class WS {
  client: Client;
  private ws?: WebSocket;
  private client_id?: string;
  private request_id = 1;
  private channels: EventEmitter;
  constructor(client: Client) {
    this.client = client;
    this.channels = new EventEmitter();
  }
  init = async () =>
    new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket("wss://push.groupme.com/faye")
        .on("open", () => {
          this.handshake();
        })
        .on("message", (data) => this.handle(data));
      this.channels
        .once("/meta/handshake", (data) => {
          if (!this.client.user)
            return reject("Client user must be defined before init");
          this.client_id = data.clientId;
          this.subscribe(`/user/${this.client.user.id}`);
        })
        .once("/meta/subscribe", (data) => {
          this.connect();
          resolve();
        })
        .on("/meta/connect", (data) => {
          this.connect();
        });
      // this.debug();
    });
  private handle = (data: WebSocket.Data) => {
    const parsed = JSON.parse(data.toString())[0];
    ok(parsed);
    ok(parsed.channel);
    this.channels.emit(parsed.channel, parsed);
  };

  private send = (data: any) => {
    ok(this.ws);
    data.id = this.request_id++;
    data.clientId = this.client_id;
    const str = JSON.stringify([data]);
    this.ws.send(str, (err) => {
      if (err) {
        console.error("An error occurred while trying to send:", data);
        throw err;
      }
      // console.log('SENT:', data)
    });
  };
  private handshake = () => {
    this.send({
      channel: "/meta/handshake",
      version: "1.0",
      supportedConnectionTypes: ["websocket"],
    });
  };
  private subscribe = (channel: string) => {
    this.send({
      channel: "/meta/subscribe",
      subscription: channel,
      ext: { access_token: this.client.token },
    });
  };
  private connect = () => {
    this.send({
      channel: "/meta/connect",
      connectionType: "websocket",
    });
  };

  close() {
    if (this.ws) this.ws.close();
  }

  debug() {
    ok(this.ws);

    this.ws
      .on("open", () => {
        console.log("Event: OPEN");
      })
      .on("upgrade", (request) => {
        console.log("Event: UPGRADE");
        console.log("Request:", request.headers);
      })
      .on("close", (code, reason) => {
        console.log("Event: CLOSE");
        console.log("Code:", code);
        console.log("Reason:", reason.toString());
        console.log();
      })
      .on("message", (data) => {
        console.log("MESSAGE:", JSON.parse(data.toString())[0]);
      })
      .on("ping", (data) => {
        console.log("PING:", data.toString());
      })
      .on("pong", (data) => {
        console.log("PONG:", data.toString());
      })
      .on("error", (err) => {
        console.log("Event: ERROR");
        console.log("Error:", err);
      })
      .on("unexpected-response", (request, response) => {
        console.log("Event: UNEXPECTED RESPONSE");
        console.log("Request:", request.getHeaders());
        console.log("Response:", response.headers);
      });
  }
}
