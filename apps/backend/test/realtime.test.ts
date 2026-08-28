import assert from "node:assert/strict";
import test from "node:test";
import http from "node:http";
import jwt from "jsonwebtoken";

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/helpdesk-test";
process.env.JWT_ACCESS_SECRET = "test-access-secret-that-is-at-least-32-characters";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-that-is-at-least-32-characters";
process.env.LOG_LEVEL = "error";

const [
  { registerChatHandlers },
  { registerMessageHandlers },
  { registerPresenceHandlers },
  { registerTypingHandlers },
  { authenticateSocket },
  { ticketRoom },
  { ticketRepository },
  { userRepository },
  { MessageService },
  { getIO, initSocket },
] = await Promise.all([
  import("../src/realtime/handlers/chat.handler.js"),
  import("../src/realtime/handlers/message.handler.js"),
  import("../src/realtime/handlers/presence.handler.js"),
  import("../src/realtime/handlers/typing.handler.js"),
  import("../src/realtime/middlewares/socketAuth.middleware.js"),
  import("../src/realtime/rooms.js"),
  import("../src/modules/tickets/ticket.repository.js"),
  import("../src/modules/users/user.repository.js"),
  import("../src/modules/messages/message.service.js"),
  import("../src/realtime/io.js"),
]);

type Listener = (...args: any[]) => unknown;
type Emission = { event: string; args: unknown[] };
type RoomEmission = Emission & { room: string };

class FakeSocket {
  readonly id = "socket-1";
  readonly data: { user: { id: string; role: "customer" | "agent" } };
  readonly handshake: { auth: { token?: string } };
  readonly joinedRooms: string[] = [];
  readonly leftRooms: string[] = [];
  readonly emissions: Emission[] = [];
  readonly broadcasts: RoomEmission[] = [];
  readonly listeners = new Map<string, Listener>();

  constructor(user = { id: "user-1", role: "customer" as const }, token?: string) {
    this.data = { user };
    this.handshake = { auth: { token } };
  }

  readonly broadcast = {
    to: (room: string) => ({
      emit: (event: string, ...args: unknown[]) => {
        this.broadcasts.push({ room, event, args });
      },
    }),
  };

  on(event: string, listener: Listener): this {
    this.listeners.set(event, listener);
    return this;
  }

  emit(event: string, ...args: unknown[]): this {
    this.emissions.push({ event, args });
    return this;
  }

  join(room: string): this {
    this.joinedRooms.push(room);
    return this;
  }

  leave(room: string): this {
    this.leftRooms.push(room);
    return this;
  }

  trigger(event: string, ...args: unknown[]): unknown {
    const listener = this.listeners.get(event);
    assert.ok(listener, `Expected a listener for ${event}`);
    return listener(...args);
  }
}

class FakeServer {
  readonly emissions: RoomEmission[] = [];

  to(room: string) {
    return {
      emit: (event: string, ...args: unknown[]) => {
        this.emissions.push({ room, event, args });
      },
    };
  }
}

function asSocket(socket: FakeSocket): Parameters<typeof registerChatHandlers>[1] {
  return socket as unknown as Parameters<typeof registerChatHandlers>[1];
}

function asServer(server: FakeServer): Parameters<typeof registerChatHandlers>[0] {
  return server as unknown as Parameters<typeof registerChatHandlers>[0];
}

test("ticketRoom namespaces ticket identifiers without altering them", () => {
  assert.equal(ticketRoom("ticket-123"), "ticket:ticket-123");
  assert.equal(ticketRoom(""), "ticket:");
  assert.equal(ticketRoom("tenant/42:urgent"), "ticket:tenant/42:urgent");
});

test("authenticateSocket rejects a connection without a token", () => {
  const socket = new FakeSocket();
  delete (socket.data as Partial<typeof socket.data>).user;

  let receivedError: Error | undefined;
  authenticateSocket(asSocket(socket), (error) => {
    receivedError = error;
  });

  assert.equal(receivedError?.message, "Authentication required");
  assert.equal(socket.data.user, undefined);
});

test("authenticateSocket stores the identity from a valid access token", () => {
  const token = jwt.sign({ sub: "customer-42", role: "customer" }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "5m",
  });
  const socket = new FakeSocket(undefined, token);
  delete (socket.data as Partial<typeof socket.data>).user;

  let receivedError: Error | undefined;
  authenticateSocket(asSocket(socket), (error) => {
    receivedError = error;
  });

  assert.equal(receivedError, undefined);
  assert.deepEqual(socket.data.user, { id: "customer-42", role: "customer" });
});

test("authenticateSocket rejects malformed and expired tokens", () => {
  const expiredToken = jwt.sign({ sub: "agent-1", role: "agent" }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: -1,
  });

  for (const token of ["not-a-jwt", expiredToken]) {
    const socket = new FakeSocket(undefined, token);
    let receivedError: Error | undefined;

    authenticateSocket(asSocket(socket), (error) => {
      receivedError = error;
    });

    assert.equal(receivedError?.message, "Invalid or expired token");
  }
});

test("chat ping responds only to the requesting socket", () => {
  const socket = new FakeSocket();
  const io = new FakeServer();
  registerChatHandlers(asServer(io), asSocket(socket));

  socket.trigger("ping-test", { request: 1 });

  assert.deepEqual(socket.emissions, [{ event: "pong-test", args: ["Server got your message!"] }]);
  assert.deepEqual(io.emissions, []);
});

test("ticket:join admits the ticket's customer", async (t) => {
  t.mock.method(
    ticketRepository,
    "findById",
    async () =>
      ({
        customer: { toString: () => "customer-1" },
        agent: undefined,
      }) as never,
  );
  const socket = new FakeSocket({ id: "customer-1", role: "customer" });
  registerChatHandlers(asServer(new FakeServer()), asSocket(socket));
  const acknowledgements: boolean[] = [];

  await socket.trigger("ticket:join", "ticket-1", (ok: boolean) => acknowledgements.push(ok));

  assert.deepEqual(socket.joinedRooms, ["ticket:ticket-1"]);
  assert.deepEqual(acknowledgements, [true]);
});

test("ticket:join admits the assigned agent", async (t) => {
  t.mock.method(
    ticketRepository,
    "findById",
    async () =>
      ({
        customer: { toString: () => "customer-1" },
        agent: { toString: () => "agent-1" },
      }) as never,
  );
  const socket = new FakeSocket({ id: "agent-1", role: "agent" });
  registerChatHandlers(asServer(new FakeServer()), asSocket(socket));
  const acknowledgements: boolean[] = [];

  await socket.trigger("ticket:join", "ticket-1", (ok: boolean) => acknowledgements.push(ok));

  assert.deepEqual(socket.joinedRooms, ["ticket:ticket-1"]);
  assert.deepEqual(acknowledgements, [true]);
});

test("ticket:join rejects missing tickets and non-participants", async (t) => {
  const findById = t.mock.method(ticketRepository, "findById", async () => null);
  const socket = new FakeSocket({ id: "agent-2", role: "agent" });
  registerChatHandlers(asServer(new FakeServer()), asSocket(socket));
  const acknowledgements: boolean[] = [];

  await socket.trigger("ticket:join", "missing", (ok: boolean) => acknowledgements.push(ok));
  findById.mock.mockImplementation(
    async () =>
      ({
        customer: { toString: () => "customer-1" },
        agent: { toString: () => "agent-1" },
      }) as never,
  );
  await socket.trigger("ticket:join", "private", (ok: boolean) => acknowledgements.push(ok));

  assert.deepEqual(socket.joinedRooms, []);
  assert.deepEqual(acknowledgements, [false, false]);
});

test("ticket:join rejects an unassigned agent", async (t) => {
  t.mock.method(
    ticketRepository,
    "findById",
    async () =>
      ({
        customer: { toString: () => "customer-1" },
        agent: undefined,
      }) as never,
  );
  const socket = new FakeSocket({ id: "agent-1", role: "agent" });
  registerChatHandlers(asServer(new FakeServer()), asSocket(socket));
  const acknowledgements: boolean[] = [];

  await socket.trigger("ticket:join", "ticket-1", (ok: boolean) => acknowledgements.push(ok));

  assert.deepEqual(socket.joinedRooms, []);
  assert.deepEqual(acknowledgements, [false]);
});

test("ticket:leave removes the socket from the namespaced room", () => {
  const socket = new FakeSocket();
  registerChatHandlers(asServer(new FakeServer()), asSocket(socket));

  socket.trigger("ticket:leave", "ticket-9");

  assert.deepEqual(socket.leftRooms, ["ticket:ticket-9"]);
});

test("message:send persists and broadcasts the service result", async (t) => {
  const payload = { ticketId: "ticket-1", data: { body: "Hello" } };
  const savedMessage = { id: "message-1", body: "Hello" };
  const sendMessage = t.mock.method(
    MessageService.prototype,
    "sendMessage",
    async () => savedMessage as never,
  );
  const socket = new FakeSocket({ id: "customer-1", role: "customer" });
  const io = new FakeServer();
  registerMessageHandlers(asServer(io), asSocket(socket));
  const acknowledgements: boolean[] = [];

  await socket.trigger("message:send", payload, (ok: boolean) => acknowledgements.push(ok));

  assert.deepEqual(sendMessage.mock.calls[0].arguments, [
    "ticket-1",
    "customer-1",
    "customer",
    payload.data,
  ]);
  assert.deepEqual(io.emissions, [
    { room: "ticket:ticket-1", event: "message:new", args: [savedMessage] },
  ]);
  assert.deepEqual(acknowledgements, [true]);
});

test("message:send acknowledges failure and does not broadcast", async (t) => {
  t.mock.method(MessageService.prototype, "sendMessage", async () => {
    throw new Error("persistence failed");
  });
  const socket = new FakeSocket();
  const io = new FakeServer();
  registerMessageHandlers(asServer(io), asSocket(socket));
  const acknowledgements: boolean[] = [];

  await socket.trigger(
    "message:send",
    { ticketId: "ticket-1", data: { body: "Hello" } },
    (ok: boolean) => acknowledgements.push(ok),
  );

  assert.deepEqual(io.emissions, []);
  assert.deepEqual(acknowledgements, [false]);
});

test("message:read marks the message and broadcasts the updated result", async (t) => {
  const updatedMessage = { id: "message-1", readAt: new Date("2026-01-01T00:00:00Z") };
  const markMessageRead = t.mock.method(
    MessageService.prototype,
    "markMessageRead",
    async () => updatedMessage as never,
  );
  const socket = new FakeSocket({ id: "agent-1", role: "agent" });
  const io = new FakeServer();
  registerMessageHandlers(asServer(io), asSocket(socket));
  const acknowledgements: boolean[] = [];

  await socket.trigger(
    "message:read",
    { ticketId: "ticket-1", messageId: "message-1" },
    (ok: boolean) => acknowledgements.push(ok),
  );

  assert.deepEqual(markMessageRead.mock.calls[0].arguments, ["message-1", "agent-1"]);
  assert.deepEqual(io.emissions, [
    { room: "ticket:ticket-1", event: "message:read", args: [updatedMessage] },
  ]);
  assert.deepEqual(acknowledgements, [true]);
});

test("message:read acknowledges failure and does not broadcast", async (t) => {
  t.mock.method(MessageService.prototype, "markMessageRead", async () => {
    throw new Error("message not found");
  });
  const socket = new FakeSocket();
  const io = new FakeServer();
  registerMessageHandlers(asServer(io), asSocket(socket));
  const acknowledgements: boolean[] = [];

  await socket.trigger(
    "message:read",
    { ticketId: "ticket-1", messageId: "missing" },
    (ok: boolean) => acknowledgements.push(ok),
  );

  assert.deepEqual(io.emissions, []);
  assert.deepEqual(acknowledgements, [false]);
});

test("presence joins the shared room and announces the user to other sockets", () => {
  const socket = new FakeSocket({ id: "agent-1", role: "agent" });
  registerPresenceHandlers(asServer(new FakeServer()), asSocket(socket));

  assert.deepEqual(socket.joinedRooms, ["presence"]);
  assert.deepEqual(socket.broadcasts, [
    { room: "presence", event: "presence:online", args: [{ userId: "agent-1" }] },
  ]);
});

test("disconnect updates last seen and announces the user offline", async (t) => {
  const lastSeenAt = new Date("2026-02-03T04:05:06Z");
  const touchLastSeen = t.mock.method(
    userRepository,
    "touchLastSeen",
    async () =>
      ({
        lastSeenAt,
      }) as never,
  );
  const socket = new FakeSocket({ id: "customer-1", role: "customer" });
  const io = new FakeServer();
  registerPresenceHandlers(asServer(io), asSocket(socket));

  await socket.trigger("disconnect");

  assert.deepEqual(touchLastSeen.mock.calls[0].arguments, ["customer-1"]);
  assert.deepEqual(io.emissions, [
    {
      room: "presence",
      event: "presence:offline",
      args: [{ userId: "customer-1", lastSeenAt }],
    },
  ]);
});

test("disconnect still announces offline when the user record no longer exists", async (t) => {
  t.mock.method(userRepository, "touchLastSeen", async () => null);
  const socket = new FakeSocket();
  const io = new FakeServer();
  registerPresenceHandlers(asServer(io), asSocket(socket));

  await socket.trigger("disconnect");

  assert.deepEqual(io.emissions, [
    {
      room: "presence",
      event: "presence:offline",
      args: [{ userId: "user-1", lastSeenAt: undefined }],
    },
  ]);
});

test("typing:start and typing:stop notify the ticket room with sender context", () => {
  const socket = new FakeSocket({ id: "customer-1", role: "customer" });
  registerTypingHandlers(asServer(new FakeServer()), asSocket(socket));

  socket.trigger("typing:start", "ticket-1");
  socket.trigger("typing:stop", "ticket-1");

  assert.deepEqual(socket.broadcasts, [
    {
      room: "ticket:ticket-1",
      event: "typing:start",
      args: [{ ticketId: "ticket-1", userId: "customer-1" }],
    },
    {
      room: "ticket:ticket-1",
      event: "typing:stop",
      args: [{ ticketId: "ticket-1", userId: "customer-1" }],
    },
  ]);
});

test("initSocket stores the initialized server for getIO", async () => {
  assert.throws(() => getIO(), /Socket\.io not initialized\. Call initSocket\(\) first\./);

  const httpServer = http.createServer();
  const io = initSocket(httpServer);

  assert.equal(getIO(), io);
  await io.close();
});
