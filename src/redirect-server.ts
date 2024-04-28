import { type Server } from "bun";
import { Future } from "./future";
import { Option, Result, Ok, Err } from "./option-result";

export type RedirectServerOptions = Readonly<{
    clientId: string;
    clientSecret: string;
    csrfToken: string;
    port: number;
    redirectUri: string;
}>;

export type StartServer = () => Result<Server, Error>;

export type RedirectServer = Readonly<{
    mailbox: Future<string, Error>;
    start: () => Result<RedirectServer, Error>;
    stop: () => Result<void, Error>;
}>;

export class RedirectServerService {
    static make(options: RedirectServerOptions): Result<RedirectServer, Error> {
        return Result.of(() => {
            const mailbox = new Future<string, Error>();
            const router = makeRouter(mailbox, options);
            return {
                mailbox,
                start: () => {
                    const server = Bun.serve({
                        port: options.port,
                        fetch: router,
                    });
                    return Ok({
                        mailbox,
                        start: () => Err(new Error("RedirectServer is already running")),
                        stop: () => Ok(server.stop()),
                    });
                },
                stop: () => Err(new Error("RedirectServer is not running")),
            };
        });
    }
}

function makeRouter(
    mailbox: Future<string, Error>,
    _options: RedirectServerOptions,
): (req: Request) => Response {
    return function router(req: Request) {
        return Result.of<Response>(() => {
            const url = new URL(req.url);
            switch (url.pathname) {
                case "/ping":
                    return new Response("pong");
                case "/spotify": {
                    const params = {
                        code: Option.of(url.searchParams.get("code")).okOr("no code received"),
                        state: Option.of(url.searchParams.get("state")).okOr("no state received"),
                    };
                    if (params.code.isOk() && params.state.isOk()) {
                        mailbox.resolve(params.code.unwrap());
                        return new Response("success");
                    }
                    const msg = params.code.err().unwrapOr(params.state.unwrapErr());
                    mailbox.reject(new Error(msg));
                    return new Response(`bad request: ${msg}`, { status: 400 });
                }
                default: {
                    mailbox.reject(new Error("not found"));
                    return new Response("not found", { status: 404 });
                }
            }
        }).unwrapOrElse((e) => {
            mailbox.reject(e);
            return new Response("internal server error", { status: 500 });
        });
    };
}
