import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

/* =====================================================
   ENVIRONMENT VARIABLES
===================================================== */

const RESEND_API_KEY =
  Deno.env.get("RESEND_API_KEY");

const OWNER_EMAIL =
  Deno.env.get("OWNER_EMAIL") ||
  "shadowtourpackagesknr@gmail.com";

/*
 * For production, use a verified Resend domain.
 *
 * Example:
 * from: "Shadow Tour Packages <booking@yourdomain.com>"
 *
 * For initial testing, Resend may allow:
 * onboarding@resend.dev
 */

/* =====================================================
   CORS
===================================================== */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",

  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",

  "Access-Control-Allow-Methods":
    "GET, POST, OPTIONS",
};

/* =====================================================
   HELPER
===================================================== */

const jsonResponse = (
  data: unknown,
  status = 200
) => {
  return new Response(
    JSON.stringify(data),
    {
      status,

      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json",
      },
    }
  );
};

/* =====================================================
   SEND BOOKING EMAIL
===================================================== */

const sendBookingEmail = async (
  booking: any
) => {

  if (!RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  const formattedDate =
    booking.travel_date
      ? new Date(
        booking.travel_date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
      : "Not Specified";

  const customerEmail =
    booking.email || "";

  const customerEmailDisplay =
    customerEmail
      ? `
        <a href="mailto:${customerEmail}">
          ${customerEmail}
        </a>
      `
      : `
        <span style="
          color:#e53e3e;
          font-weight:bold;
        ">
          Not Provided
        </span>
      `;

  const contactAdvice =
    customerEmail
      ? `
        You can reply directly to
        <strong>${customerEmail}</strong>
        or call
        <a href="tel:${booking.phone}">
          ${booking.phone}
        </a>.
      `
      : `
        <strong>Note:</strong>
        Customer did not provide an email.
        Contact them directly by phone at
        <a href="tel:${booking.phone}">
          ${booking.phone}
        </a>.
      `;

  /* ===================================================
     HTML EMAIL
  =================================================== */

  const htmlContent = `
    <div style="
      font-family:Arial,sans-serif;
      line-height:1.6;
      color:#222;
      max-width:600px;
      margin:0 auto;
      border:1px solid #e0e0e0;
      border-radius:8px;
      overflow:hidden;
    ">

      <div style="
        background-color:#1a202c;
        color:#ffffff;
        padding:20px;
        text-align:center;
      ">

        <h2 style="
          margin:0;
          font-size:22px;
        ">
          Shadow Tour Packages
        </h2>

        <p style="
          margin:5px 0 0;
          font-size:14px;
          color:#cbd5e0;
        ">
          New Customer Tour Enquiry Received
        </p>

      </div>

      <div style="padding:24px;">

        <table style="
          width:100%;
          border-collapse:collapse;
          margin-bottom:20px;
        ">

          <tr>
            <td style="
              padding:8px 0;
              border-bottom:1px solid #edf2f7;
              font-weight:bold;
              width:40%;
            ">
              Reference ID:
            </td>

            <td style="
              padding:8px 0;
              border-bottom:1px solid #edf2f7;
              color:#2b6cb0;
            ">
              ${booking.booking_reference}
            </td>
          </tr>

          <tr>
            <td style="
              padding:8px 0;
              border-bottom:1px solid #edf2f7;
              font-weight:bold;
            ">
              Customer Name:
            </td>

            <td style="
              padding:8px 0;
              border-bottom:1px solid #edf2f7;
            ">
              ${booking.name}
            </td>
          </tr>

          <tr>
            <td style="
              padding:8px 0;
              border-bottom:1px solid #edf2f7;
              font-weight:bold;
            ">
              Phone Number:
            </td>

            <td style="
              padding:8px 0;
              border-bottom:1px solid #edf2f7;
            ">
              <a href="tel:${booking.phone}">
                ${booking.phone}
              </a>
            </td>
          </tr>

          <tr>
            <td style="
              padding:8px 0;
              border-bottom:1px solid #edf2f7;
              font-weight:bold;
            ">
              Email Address:
            </td>

            <td style="
              padding:8px 0;
              border-bottom:1px solid #edf2f7;
            ">
              ${customerEmailDisplay}
            </td>
          </tr>

          <tr>
            <td style="
              padding:8px 0;
              border-bottom:1px solid #edf2f7;
              font-weight:bold;
            ">
              Destination:
            </td>

            <td style="
              padding:8px 0;
              border-bottom:1px solid #edf2f7;
              text-transform:capitalize;
            ">
              ${booking.destination}
            </td>
          </tr>

          <tr>
            <td style="
              padding:8px 0;
              border-bottom:1px solid #edf2f7;
              font-weight:bold;
            ">
              Package Category:
            </td>

            <td style="
              padding:8px 0;
              border-bottom:1px solid #edf2f7;
              color:#2b6cb0;
              font-weight:600;
            ">
              ${booking.category}
            </td>
          </tr>

          <tr>
            <td style="
              padding:8px 0;
              border-bottom:1px solid #edf2f7;
              font-weight:bold;
            ">
              Travellers:
            </td>

            <td style="
              padding:8px 0;
              border-bottom:1px solid #edf2f7;
            ">
              ${booking.travellers}
            </td>
          </tr>

          <tr>
            <td style="
              padding:8px 0;
              border-bottom:1px solid #edf2f7;
              font-weight:bold;
            ">
              Travel Date:
            </td>

            <td style="
              padding:8px 0;
              border-bottom:1px solid #edf2f7;
            ">
              ${formattedDate}
            </td>
          </tr>

        </table>

        <p style="
          font-size:13px;
          color:#4a5568;
        ">
          ${contactAdvice}
        </p>

      </div>

    </div>
  `;

  /* ===================================================
     TEXT EMAIL FALLBACK
  =================================================== */

  const textFallback = `
New Tour Enquiry Received - Shadow Tour Packages

------------------------------------------------

Reference ID:
${booking.booking_reference}

Customer Name:
${booking.name}

Phone:
${booking.phone}

Email:
${booking.email || "Not Provided"}

Destination:
${booking.destination}

Category:
${booking.category}

Travellers:
${booking.travellers}

Travel Date:
${formattedDate}

------------------------------------------------
  `.trim();

  /* ===================================================
     RESEND REQUEST
  =================================================== */

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${RESEND_API_KEY}`,
      },

      body: JSON.stringify({

        /*
         * TESTING
         *
         * Use onboarding@resend.dev
         * while testing Resend.
         *
         * For production, replace this
         * with your verified domain.
         */

        from:
          "Shadow Tour Packages <onboarding@resend.dev>",

        to: [
          OWNER_EMAIL,
        ],

        subject:
          `New Tour Enquiry - ${booking.destination.toUpperCase()} (${booking.booking_reference})`,

        html:
          htmlContent,

        text:
          textFallback,

        ...(customerEmail
          ? {
            reply_to:
              customerEmail,
          }
          : {}),
      }),
    }
  );

  const result =
    await response.json();

  if (!response.ok) {

    console.error(
      "[RESEND ERROR]",
      result
    );

    throw new Error(
      result?.message ||
      "Failed to send email."
    );
  }

  console.log(
    "[EMAIL SENT]",
    result
  );

  return result;
};

/* =====================================================
   SUPABASE EDGE FUNCTION
===================================================== */

export default {

  fetch: withSupabase(
    {
      auth: [
        "publishable",
        "secret",
      ],
    },

    async (req, ctx) => {

      /* =================================================
         CORS PREFLIGHT
      ================================================= */

      if (
        req.method === "OPTIONS"
      ) {
        return new Response(
          "ok",
          {
            status: 200,
            headers:
              corsHeaders,
          }
        );
      }

      try {

        /* =================================================
           GET BOOKINGS
        ================================================= */

        if (
          req.method === "GET"
        ) {

          const {
            data,
            error,
          } =
            await ctx.supabaseAdmin
              .from("bookings")
              .select("*")
              .order(
                "created_at",
                {
                  ascending:
                    false,
                }
              );

          if (error) {

            console.error(
              "[GET BOOKINGS ERROR]",
              error
            );

            return jsonResponse(
              {
                ok: false,

                message:
                  "Failed to fetch bookings.",

                error:
                  error.message,
              },
              500
            );
          }

          return jsonResponse({
            ok: true,

            count:
              data?.length || 0,

            data:
              data || [],
          });
        }

        /* =================================================
           ONLY POST AFTER THIS
        ================================================= */

        if (
          req.method !== "POST"
        ) {

          return jsonResponse(
            {
              ok: false,

              message:
                "Method not allowed.",
            },
            405
          );
        }

        /* =================================================
           READ REQUEST
        ================================================= */

        const body =
          await req.json();

        const {
          name,
          email,
          phone,
          destination,
          category,
          travellers,
          travelDate,
        } = body || {};

        /* =================================================
           VALIDATION
        ================================================= */

        const errors: Record<
          string,
          string
        > = {};

        /* NAME */

        if (
          !name ||
          typeof name !== "string" ||
          !name.trim()
        ) {

          errors.name =
            "Please enter your full name.";

        } else if (
          name.trim().length < 2
        ) {

          errors.name =
            "Name must be at least 2 characters long.";
        }

        /* PHONE */

        const phoneRegex =
          /^[+\d][\d\s-]{7,15}$/;

        if (
          !phone ||
          typeof phone !== "string" ||
          !phoneRegex.test(
            phone.trim()
          )
        ) {

          errors.phone =
            "Please provide a valid phone number.";
        }

        /* DESTINATION */

        if (
          !destination ||
          typeof destination !== "string" ||
          !destination.trim()
        ) {

          errors.destination =
            "Please choose or enter a destination.";
        }

        /* CATEGORY */

        const allowedCategories = [
          "School",
          "College",
          "Staff",
          "Family",
          "Bachelors",
        ];

        if (
          !category ||
          !allowedCategories.includes(
            category.trim()
          )
        ) {

          errors.category =
            "Please choose a valid group category.";
        }

        /* TRAVELLERS */

        const travellerCount =
          Number(travellers);

        if (
          !Number.isInteger(
            travellerCount
          ) ||
          travellerCount < 1
        ) {

          errors.travellers =
            "At least 1 traveller is required.";

        } else if (
          travellerCount > 50
        ) {

          errors.travellers =
            "Maximum 50 travellers are permitted.";
        }

        /* EMAIL */

        if (
          email &&
          typeof email === "string"
        ) {

          const emailRegex =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

          if (
            !emailRegex.test(
              email.trim()
            )
          ) {

            errors.email =
              "Please provide a valid email address.";
          }
        }

        /* =================================================
           RETURN VALIDATION ERRORS
        ================================================= */

        if (
          Object.keys(errors)
            .length > 0
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

        /* =================================================
           BOOKING REFERENCE
        ================================================= */

        const bookingReference =
          `ST-${Date.now()
            .toString()
            .slice(-6)}`;

        /* =================================================
           TRAVEL DATE
        ================================================= */

        let travelDateValue =
          null;

        if (
          travelDate &&
          typeof travelDate === "string"
        ) {

          const parsedDate =
            new Date(
              travelDate
            );

          if (
            !Number.isNaN(
              parsedDate.getTime()
            )
          ) {

            travelDateValue =
              travelDate;
          }
        }

        /* =================================================
           INSERT DATA
        ================================================= */

        const insertData = {

          booking_reference:
            bookingReference,

          name:
            name.trim(),

          email:
            email &&
              typeof email === "string"
              ? email
                .trim()
                .toLowerCase()
              : null,

          phone:
            phone.trim(),

          destination:
            destination.trim(),

          category:
            category.trim(),

          travellers:
            travellerCount,

          travel_date:
            travelDateValue,

          email_notification_status:
            "pending",
        };

        console.log(
          "[BOOKING INSERT]",
          insertData
        );

        /* =================================================
           SAVE TO SUPABASE
        ================================================= */

        const {
          data: booking,
          error,
        } =
          await ctx.supabaseAdmin
            .from("bookings")
            .insert(
              insertData
            )
            .select("*")
            .single();

        /* =================================================
           DATABASE ERROR
        ================================================= */

        if (error) {
          console.error("[SUPABASE INSERT ERROR]", error);

          return jsonResponse(
            {
              ok: false,
              message: "Try Again or Please check your connection or call us.",
            },
            500
          );
        }
        /* =================================================
           SEND EMAIL
        ================================================= */

        let emailStatus =
          "failed";

        try {

          await sendBookingEmail(
            booking
          );

          emailStatus =
            "sent";

          /* ===============================================
             UPDATE EMAIL STATUS
          =============================================== */

          const {
            error:
            updateError,
          } =
            await ctx
              .supabaseAdmin
              .from("bookings")
              .update({
                email_notification_status:
                  "sent",
              })
              .eq(
                "id",
                booking.id
              );

          if (updateError) {

            console.error(
              "[EMAIL STATUS UPDATE ERROR]",
              updateError
            );
          }

        } catch (
        emailError
        ) {

          console.error(
            "[EMAIL ERROR]",
            emailError
          );

          /* ===============================================
             MARK EMAIL AS FAILED
          =============================================== */

          const {
            error:
            statusError,
          } =
            await ctx
              .supabaseAdmin
              .from("bookings")
              .update({
                email_notification_status:
                  "failed",
              })
              .eq(
                "id",
                booking.id
              );

          if (statusError) {

            console.error(
              "[STATUS UPDATE ERROR]",
              statusError
            );
          }
        }

        /* =================================================
           FINAL RESPONSE
        ================================================= */

        return jsonResponse(
          {
            ok: true,

            message:
              "Booking enquiry registered successfully.",

            emailNotificationStatus:
              emailStatus,

            data: {
              ...booking,

              email_notification_status:
                emailStatus,
            },
          },
          201
        );

      } catch (error) {
        console.error(
          "[BOOKINGS FUNCTION ERROR]",
          error
        );

        return jsonResponse(
          {
            ok: false,
            message:
              "Try Again or Please check your connection or call us.",
          },
          500
        );
      }
    }
  ),
};