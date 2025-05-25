import { httpRouter } from "convex/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return new Response("Webhook secret is not set", {
        status: 500,
      });
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    console.log(svix_id);
    console.log(svix_signature);
    console.log(svix_timestamp);

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("Missing required headers", {
        status: 400,
      });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: any;

    // Verify the webhook signature
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-signature": svix_signature,
        "svix-timestamp": svix_timestamp,
      }) as any;
    } catch (error) {
      console.error("Error verifying webhook signature:", error);
      return new Response("Invalid signature", {
        status: 400,
      });
    }

    const eventType = evt.type;

    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name } = evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.createUser, {
          username: name,
          email: email,
          photo: "kg290fvdtc49na8q1detdq90717gkb78",
          clerkId: id,
          tripId: "",
        });
      } catch (error) {
        console.error("Error creating user:", error);
        return new Response("Error creating user", {
          status: 500,
        });
      }
    }

    return new Response("OK", {
      status: 200,
    });
  }),
});

export default http;
