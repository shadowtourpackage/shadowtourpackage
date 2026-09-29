import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "GET, POST, PATCH, DELETE, OPTIONS",
};

const validTypes = ["text", "video"];

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

      /* =================================================
         GET APPROVED REVIEWS
      ================================================= */

      if (req.method === "GET") {
        try {

          const {
            data,
            error,
          } = await ctx.supabaseAdmin
            .from("reviews")
            .select("*")
            .eq("approved", true)
            .order("created_at", {
              ascending: false,
            });

          if (error) {
            console.error(
              "[Reviews GET Error]",
              error
            );

            return jsonResponse(
              {
                ok: false,
                message:
                  "Failed to fetch reviews.",
              },
              500
            );
          }

          return jsonResponse({
            ok: true,
            count: data?.length || 0,
            data: data || [],
          });

        } catch (error) {

          console.error(
            "[Reviews GET Exception]",
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

      /* =================================================
         POST NEW REVIEW
      ================================================= */

      if (req.method === "POST") {
        try {

          const body =
            await req.json();

          const {
            name,
            destination,
            rating,
            review,
            type,
            videoUrl,
          } = body || {};

          const errors: Record<
            string,
            string
          > = {};

          /* =============================================
             NAME
          ============================================= */

          if (
            !name ||
            typeof name !== "string" ||
            !name.trim()
          ) {
            errors.name =
              "Name is required.";
          }

          /* =============================================
             DESTINATION
          ============================================= */

          if (
            !destination ||
            typeof destination !== "string" ||
            !destination.trim()
          ) {
            errors.destination =
              "Destination is required.";
          }

          /* =============================================
             TYPE
          ============================================= */

          const reviewType =
            type === "video"
              ? "video"
              : "text";

          if (
            !validTypes.includes(
              reviewType
            )
          ) {
            errors.type =
              "Invalid review type.";
          }

          /* =============================================
             RATING
          ============================================= */

          const reviewRating =
            Number(rating) || 5;

          if (
            reviewRating < 1 ||
            reviewRating > 5
          ) {
            errors.rating =
              "Rating must be between 1 and 5.";
          }

          /* =============================================
             REVIEW TEXT
          ============================================= */

          const reviewText =
            typeof review === "string"
              ? review.trim()
              : "";

          if (
            reviewText.length > 500
          ) {
            errors.review =
              "Review cannot exceed 500 characters.";
          }

          /* =============================================
             VIDEO URL
          ============================================= */

          const cleanVideoUrl =
            typeof videoUrl === "string"
              ? videoUrl.trim()
              : "";

          if (
            reviewType === "video" &&
            !cleanVideoUrl
          ) {
            errors.videoUrl =
              "Video URL is required for video reviews.";
          }

          /* =============================================
             VALIDATION RESPONSE
          ============================================= */

          if (
            Object.keys(errors).length > 0
          ) {
            return jsonResponse(
              {
                ok: false,
                message:
                  "Validation failed.",
                errors,
              },
              422
            );
          }

          /* =============================================
             INSERT REVIEW
          ============================================= */

          const {
            data,
            error,
          } = await ctx.supabaseAdmin
            .from("reviews")
            .insert({
              type: reviewType,

              name:
                name.trim(),

              destination:
                destination.trim(),

              rating:
                reviewRating,

              review:
                reviewText,

              video_url:
                cleanVideoUrl,

              approved:
                false,
            })
            .select("*")
            .single();

          if (error) {

            console.error(
              "[Review Insert Error]",
              error
            );

            return jsonResponse(
              {
                ok: false,
                message:
                  "Failed to submit review.",
                error:
                  error.message,
              },
              500
            );
          }

          return jsonResponse(
            {
              ok: true,
              message:
                "Review submitted successfully and is awaiting approval.",
              data,
            },
            201
          );

        } catch (error) {

          console.error(
            "[Review POST Exception]",
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

      /* =================================================
         PATCH REVIEW
         
         Used by admin to approve/reject a review.
      ================================================= */

      if (req.method === "PATCH") {
        try {

          const body =
            await req.json();

          const {
            id,
            approved,
          } = body || {};

          if (!id) {
            return jsonResponse(
              {
                ok: false,
                message:
                  "Review ID is required.",
              },
              400
            );
          }

          if (
            typeof approved !==
            "boolean"
          ) {
            return jsonResponse(
              {
                ok: false,
                message:
                  "Approved must be true or false.",
              },
              400
            );
          }

          const {
            data,
            error,
          } = await ctx.supabaseAdmin
            .from("reviews")
            .update({
              approved,
              updated_at:
                new Date().toISOString(),
            })
            .eq("id", id)
            .select("*")
            .single();

          if (error) {

            console.error(
              "[Review PATCH Error]",
              error
            );

            return jsonResponse(
              {
                ok: false,
                message:
                  "Failed to update review.",
                error:
                  error.message,
              },
              500
            );
          }

          return jsonResponse({
            ok: true,
            message:
              approved
                ? "Review approved successfully."
                : "Review rejected successfully.",
            data,
          });

        } catch (error) {

          console.error(
            "[Review PATCH Exception]",
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

      /* =================================================
         DELETE REVIEW
      ================================================= */

      if (req.method === "DELETE") {
        try {

          const url =
            new URL(req.url);

          const id =
            url.searchParams.get(
              "id"
            );

          if (!id) {
            return jsonResponse(
              {
                ok: false,
                message:
                  "Review ID is required.",
              },
              400
            );
          }

          const {
            error,
          } = await ctx.supabaseAdmin
            .from("reviews")
            .delete()
            .eq("id", id);

          if (error) {

            console.error(
              "[Review DELETE Error]",
              error
            );

            return jsonResponse(
              {
                ok: false,
                message:
                  "Failed to delete review.",
                error:
                  error.message,
              },
              500
            );
          }

          return jsonResponse({
            ok: true,
            message:
              "Review deleted successfully.",
          });

        } catch (error) {

          console.error(
            "[Review DELETE Exception]",
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

      /* =================================================
         METHOD NOT ALLOWED
      ================================================= */

      return jsonResponse(
        {
          ok: false,
          message:
            "Method not allowed.",
        },
        405
      );
    }
  ),
};