import { Comment, Database } from "@/db/Database";
import { Hono } from "hono";
import { Layout } from "./Layout";
import z from "zod";

function renderComment(c: Comment) {
    return (
        <section class="card" id={`comment-${c.id}`}>
            <p>{c.id}</p>
            <p>{c.createdAt}</p>
            <p>{c.author}</p>
            <p>{c.text}</p>
            <button hx-get={`/ui/edit-comment/${c.id}`}>Edit</button>
        </section>
    );
}

function oobSwapComment(c: Comment) {
    return (
        <hx-partial
            hx-target={`#comment-${c.id}`}
            hx-swap="outerHTML transition:true"
        >
            {renderComment(c)}
        </hx-partial>
    );
}

function editCommentDialog(c: Comment) {
    return (
        <hx-partial hx-target="#dialog-host" hx-swap="innerHTML">
            <dialog hx-on-load="this.showModal();">
                <form
                    hx-put={`/api/comment/${c.id}`}
                    hx-status-400="target:#dialog-error-result swap:innerHTML"
                    hx-on--after-request="if (event.detail.ctx.response.raw.ok) this.closest('dialog').close()"
                >
                    <h4>Edit comment</h4>

                    <label>
                        Author
                        <input name="author" value={c.author}></input>
                    </label>

                    <label>
                        Comment
                        <textarea name="text" rows={10} cols={60}>
                            {c.text}
                        </textarea>
                    </label>

                    <div id="dialog-error-result" class="error"></div>

                    <div class="right row">
                        <button class="primary" type="submit">
                            Submit
                        </button>
                        <button
                            class="outline"
                            type="button"
                            onclick="this.closest('dialog').close()"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </dialog>
        </hx-partial>
    );
}

function Home({ comments }: { comments: Comment[] }) {
    return (
        <main class="article column">
            <h3>Comments</h3>

            <div id="comments-list" class="column">
                {comments.map(renderComment)}
            </div>

            <form
                hx-post="/api/create-comment"
                hx-target="#comments-list"
                hx-swap="beforeend transition:true"
                hx-status-400="target:#error-result swap:innerHTML"
            >
                <h4>New comment</h4>

                <label>
                    Author
                    <input name="author"></input>
                </label>

                <label>
                    Text
                    <textarea rows={10} name="text"></textarea>
                </label>

                <div class="right">
                    <button class="primary">Submit</button>
                </div>

                <div class="error" id="error-result"></div>
            </form>

            <div id="dialog-host"></div>
        </main>
    );
}

export function registerHome(app: Hono<{ Bindings: Env }>, db: Database) {
    app.get("/", async (c) => {
        const comments = await db.selectFrom("comments").selectAll().execute();

        return c.html(
            <Layout title="Home">
                <Home comments={comments} />
            </Layout>,
        );
    });

    app.get("/api/comments", async (c) => {
        const comments = await db.selectFrom("comments").selectAll().execute();
        return c.json(comments);
    });

    const ValidComment = z.object({
        author: z.string().trim().nonempty(),
        text: z.string().trim().nonempty(),
    });

    app.post("/api/create-comment", async (c) => {
        const input = ValidComment.safeParse(await c.req.parseBody());

        if (input.error) {
            return c.newResponse(z.prettifyError(input.error), { status: 400 });
        }

        const newComment = await db
            .insertInto("comments")
            .values(input.data)
            .returningAll()
            .executeTakeFirstOrThrow();

        return c.html(renderComment(newComment));
    });

    app.get("/ui/edit-comment/:id", async (c) => {
        const comment = await db
            .selectFrom("comments")
            .selectAll()
            .where("id", "=", Number(c.req.param().id))
            .executeTakeFirst();

        if (!comment) return c.newResponse("not found", { status: 404 });

        return c.html(editCommentDialog(comment));
    });

    app.put("/api/comment/:id", async (c) => {
        const input = ValidComment.safeParse(await c.req.parseBody());

        if (input.error) {
            return c.newResponse(z.prettifyError(input.error), { status: 400 });
        }

        const updatedComment = await db
            .updateTable("comments")
            .where("id", "=", Number(c.req.param().id))
            .set(input.data)
            .returningAll()
            .executeTakeFirst();

        if (!updatedComment) return c.newResponse("not found", { status: 404 });

        return c.html(oobSwapComment(updatedComment));
    });
}
