import { Database, Comment } from "@/db/Database";
import { Hono } from "hono";
import { Layout } from "./Layout";

function Admin({ comments }: { comments: Comment[] }) {
    return (
        <main class="article">
            <h3>Admin</h3>

            <table width={"100%"}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Author</th>
                        <th>Comment</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {comments.map((c) => {
                        return (
                            <tr id={`row-${c.id}`}>
                                <td>{c.id}</td>
                                <td>{c.author}</td>
                                <td>{c.text}</td>
                                <td>
                                    <button
                                        hx-delete={`/api/delete-comment/${c.id}`}
                                        hx-confirm="Delete comment?"
                                        hx-target={`#row-${c.id}`}
                                        hx-swap="outerHTML transition:true"
                                    >
                                        x
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </main>
    );
}

export function registerAdmin(app: Hono<{ Bindings: Env }>, db: Database) {
    app.get("/admin", async (c) => {
        const comments = await db.selectFrom("comments").selectAll().execute();

        return c.html(
            <Layout title="Admin">
                <Admin comments={comments} />
            </Layout>,
        );
    });

    app.delete("/api/delete-comment/:id", async (c) => {
        await db
            .deleteFrom("comments")
            .where("id", "=", Number(c.req.param().id))
            .execute();
        return c.newResponse(null, { status: 200 }); // No content = delete
    });
}
