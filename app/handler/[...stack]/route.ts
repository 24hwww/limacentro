import { stackServerApp } from "@/lib/stack";
import { StackHandler } from "@stackframe/stack";

export const GET = StackHandler({ app: stackServerApp, fullPage: true });
export const POST = StackHandler({ app: stackServerApp, fullPage: true });
