import { StackServerApp, StackClientApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
    tokenStore: "nextjs-cookie",
    urls: {
        signIn: "/",
        afterSignIn: "/",
        afterSignOut: "/",
    },
});

export const stackClientApp = new StackClientApp({
    tokenStore: "nextjs-cookie",
    urls: {
        signIn: "/",
        afterSignIn: "/",
        afterSignOut: "/",
    },
});
