import ServerObject from "./ServerObject";
export { ServerObject };

export default {
    async fetch(req: Request, env: Env) {
        return env.SERVER.getByName("server").fetch(req)
    }
}
