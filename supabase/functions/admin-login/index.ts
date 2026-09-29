import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import bcrypt from "npm:bcryptjs@^3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

function jsonResponse(
  body: unknown,
  status = 200
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

export default {
  fetch: withSupabase(
    {
      auth: ["publishable", "secret"],
    },

    async (req, ctx) => {

      /* =================================================
         CORS
      ================================================= */

      if (req.method === "OPTIONS") {
        return new Response("ok", {
          headers: corsHeaders,
        });
      }
      if (req.method === "GET") {
        return jsonResponse({
          ok: true,
          service: "Shadow Tour Packages Admin API",
          status: "operational",
          endpoint: "admin-login",
          message: "Admin login service is running.",
        });
      }


      /* =================================================
         ONLY POST FOR LOGIN
      ================================================= */

      if (req.method !== "POST") {
        return jsonResponse(
          {
            ok: false,
            message: "Method not allowed.",
          },
          405
        );
      }
      /* =================================================
         ONLY POST
      ================================================= */

      if (req.method !== "POST") {
        return jsonResponse(
          {
            ok: false,
            message: "Method not allowed.",
          },
          405
        );
      }

      try {

        const body =
          await req.json();

        const {
          username,
          password,
        } = body || {};

        /* =============================================
           VALIDATION
        ============================================= */

        if (
          !username ||
          typeof username !== "string" ||
          !username.trim()
        ) {
          return jsonResponse(
            {
              ok: false,
              message:
                "Username is required.",
            },
            400
          );
        }

        if (
          !password ||
          typeof password !== "string"
        ) {
          return jsonResponse(
            {
              ok: false,
              message:
                "Password is required.",
            },
            400
          );
        }

        const normalizedUsername =
          username
            .trim()
            .toLowerCase();

        /* =============================================
           FIND ADMIN
        ============================================= */

        const {
          data: admin,
          error,
        } =
          await ctx.supabaseAdmin
            .from("admins")
            .select(
              "id, username, password"
            )
            .eq(
              "username",
              normalizedUsername
            )
            .maybeSingle();

        if (error) {

          console.error(
            "[Admin Login DB Error]",
            error
          );

          return jsonResponse(
            {
              ok: false,
              message:
                "Unable to process login.",
            },
            500
          );
        }

        /* =============================================
           INVALID USERNAME
        ============================================= */

        if (!admin) {
          return jsonResponse(
            {
              ok: false,
              message:
                "Invalid username or password.",
            },
            401
          );
        }

        /* =============================================
           PASSWORD CHECK
        ============================================= */

        const validPassword =
          await bcrypt.compare(
            password,
            admin.password
          );

        if (!validPassword) {
          return jsonResponse(
            {
              ok: false,
              message:
                "Invalid username or password.",
            },
            401
          );
        }

        /* =============================================
           SUCCESS
        ============================================= */

        return jsonResponse({
          ok: true,

          message:
            "Authentication successful.",

          user: {
            id: admin.id,
            username:
              admin.username,
          },
        });

      } catch (error) {

        console.error(
          "[Admin Login Exception]",
          error
        );

        return jsonResponse(
          {
            ok: false,
            message:
              error instanceof Error
                ? error.message
                : "Internal Server Error",
          },
          500
        );
      }
    }
  ),
};