import { raw } from "hono/html";
import { FC, PropsWithChildren } from "hono/jsx";

export const Layout: FC<PropsWithChildren<{ title: string }>> = ({
    title,
    children,
}) => (
    <>
        {raw("<!DOCTYPE html>")}
        <html lang="en">
            <head>
                <title>{title}</title>
                <meta charset="UTF-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <meta name="color-scheme" content="light dark" />
                <link rel="icon" href="data:," />
                <link rel="stylesheet" href="/styles.css" />
                <meta name="htmx-config" content='{"metaCharacter": "-"}' />
                <script src="/htmx-4.0.0.js"></script>
            </head>
            <body>{children}</body>
        </html>
    </>
);
