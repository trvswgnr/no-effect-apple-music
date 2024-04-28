import { randomBytes } from "crypto";
import { Result, Option } from "./option-result";
import { RedirectServerService } from "./redirect-server";
import { Browser } from "./browser";

Result.of(async () => {
    const clientId = Option.of(process.env.SPOTIFY_CLIENT_ID).unwrap();
    const clientSecret = Option.of(process.env.SPOTIFY_CLIENT_SECRET).unwrap();
    const csrfToken = randomBytes(256).toString("hex");

    const redirectServer = RedirectServerService.make({
        clientId,
        clientSecret,
        port: 3939,
        redirectUri: "/spotify",
        csrfToken,
    }).unwrap();

    const runningRedirectServer = redirectServer.start().unwrap();
    const mailbox = runningRedirectServer.mailbox;

    const redirectUri = "http://localhost:3939/spotify";

    const searchParams = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        scope: "user-read-private",
        redirect_uri: redirectUri,
        state: csrfToken,
        show_dialog: "true",
    });

    const authorizeUrl = new URL(
        `https://accounts.spotify.com/authorize?${searchParams.toString()}`,
    );

    Browser.open(authorizeUrl).mapOrElse(
        (err) => console.error(err),
        () => console.log("browser opened successfully"),
    );

    const code = await mailbox;

    console.log({ code });
}).unwrapOrElse(console.error);
