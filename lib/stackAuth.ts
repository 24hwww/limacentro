import { stackServerApp } from "./stack";

export async function getStackUser(request: Request) {
    try {
        const user = await stackServerApp.getUser();
        return user;
    } catch (error) {
        return null;
    }
}

export async function requireAuth(request: Request) {
    const user = await getStackUser(request);
    if (!user) {
        throw new Error("Unauthorized");
    }
    return user;
}
