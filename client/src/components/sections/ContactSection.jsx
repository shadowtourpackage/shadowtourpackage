import { useState, useEffect } from 'react';
import {
    CheckCircle2,
    Mail,
    MapPin,
    Phone,
} from 'lucide-react';

import { FaInstagram, FaWhatsapp } from 'react-icons/fa';

import Button from '../common/Button.jsx';
import Field from '../common/Field.jsx';
import { team } from '../../data/team.js';

/* =====================================================
   SUPABASE
===================================================== */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SUPABASE_PUBLISHABLE_KEY =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/* =====================================================
   CONTACT SECTION
===================================================== */

export default function ContactSection() {
    const [teamIndex, setTeamIndex] = useState(0);

    const [sent, setSent] = useState(false);
    const [bookingRef, setBookingRef] = useState('');

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const phoneNumber =
        import.meta.env.VITE_WHATSAPP_NUMBER;

    /* =================================================
       TEAM CAROUSEL
    ================================================= */

    useEffect(() => {
        const timer = setInterval(() => {
            setTeamIndex(
                (prev) => (prev + 1) % team.length
            );
        }, 3500);

        return () => clearInterval(timer);
    }, []);

    /* =================================================
       SUBMIT BOOKING / ENQUIRY
    ================================================= */

    async function submit(event) {
        event.preventDefault();

        setErrors({});
        setSubmitting(true);

        const formElement = event.currentTarget;

        const rawData = Object.fromEntries(
            new FormData(formElement)
        );

        const payload = {
            name: rawData.name?.trim(),

            email:
                rawData.email?.trim() || null,

            phone:
                rawData.phone?.trim(),

            destination:
                rawData.destination?.trim(),

            category:
                rawData.category?.trim(),

            travellers:
                Number(rawData.travellers),

            travelDate:
                rawData.travelDate || null,
        };

        /* =================================================
           BASIC FRONTEND VALIDATION
        ================================================= */

        const clientErrors = {};

        if (
            !payload.name ||
            payload.name.length < 2
        ) {
            clientErrors.name =
                'Please enter your full name.';
        }

        if (!payload.phone) {
            clientErrors.phone =
                'Please provide your phone number.';
        }

        if (!payload.destination) {
            clientErrors.destination =
                'Please choose or enter a destination.';
        }

        if (!payload.category) {
            clientErrors.category =
                'Please choose a group type.';
        }

        if (
            !payload.travellers ||
            payload.travellers < 1
        ) {
            clientErrors.travellers =
                'At least 1 traveller is required.';
        }

        if (
            payload.travellers > 50
        ) {
            clientErrors.travellers =
                'Maximum 50 travellers permitted.';
        }

        if (
            Object.keys(clientErrors).length > 0
        ) {
            setErrors(clientErrors);
            setSubmitting(false);
            return;
        }

        /* =================================================
           CHECK SUPABASE KEY
        ================================================= */

        if (!SUPABASE_PUBLISHABLE_KEY) {
            console.error(
                'VITE_SUPABASE_PUBLISHABLE_KEY is missing.'
            );

            setErrors({
                form:
                    'Supabase configuration is missing. Please contact the administrator.',
            });

            setSubmitting(false);
            return;
        }

        try {
            /* =================================================
               SEND TO SUPABASE EDGE FUNCTION
            ================================================= */

            const response = await fetch(
                `${API_BASE}/bookings`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json',

                        apikey:
                            SUPABASE_PUBLISHABLE_KEY,
                    },

                    body: JSON.stringify(
                        payload
                    ),
                }
            );

            /* =================================================
               READ RESPONSE SAFELY
            ================================================= */

            let result = {};

            try {
                result =
                    await response.json();
            } catch {
                result = {};
            }

            console.log(
                '[Booking Response]',
                result
            );

            /* =================================================
               SUCCESS
            ================================================= */

            if (
                response.ok &&
                result.ok
            ) {
                setBookingRef(
                    result.data
                        ?.bookingReference ||
                        result.bookingReference ||
                        ''
                );

                setSent(true);

                formElement.reset();

                return;
            }

            /* =================================================
               BACKEND VALIDATION ERROR
            ================================================= */

            setErrors(
                result.errors || {
                    form:
                        result.message ||
                        'Unable to submit enquiry. Please try again.',
                }
            );
        } catch (error) {
            console.error(
                '[Booking Error]',
                error
            );

            setErrors({
                form:
                    'Try Again or please check your connection or call us.',
            });
        } finally {
            setSubmitting(false);
        }
    }

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <section
            id="contact"
            className="booking section dark"
        >
            {/* =================================================
                LEFT SIDE - CONTACT INFORMATION
            ================================================= */}

            <div>
                <p className="eyebrow">
                    READY FOR YOUR
                </p>

                <h3>
                    NEXT JOURNEY?
                </h3>

                <p>
                    Let Shadow Tour Packages be a
                    part of your next adventure.
                </p>

                <div className="contact-details">

                    {/* PHONE */}

                    <span>
                        <Phone />
                        +91 9447319218
                    </span>

                    {/* EMAIL */}

                    <span>
                        <Mail />
                        shadowtourpackagesknr@gmail.com
                    </span>

                    {/* WHATSAPP */}

                    <span>
                        <FaWhatsapp size={24} />

                        +91 9447319218
                    </span>

                    {/* INSTAGRAM */}

                    <span>
                        <FaInstagram size={24} />

                        <a
                            href="https://www.instagram.com/shadow_tour_packages/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            shadow_tour_packages
                        </a>
                    </span>

                    {/* ADDRESS */}

                    <span>
                        <MapPin />

                        <pre>
{`Shadow Tour Packages
   KELAKAM
KANNUR KERALA 670674`}
                        </pre>
                    </span>

                </div>

                {/* =================================================
                    TEAM CAROUSEL
                ================================================= */}

                <div className="team-carousel reveal">

                    <div
                        className="team-slide animate-slide"
                        key={teamIndex}
                    >
                        <img
                            src={
                                team[
                                    teamIndex
                                ].image
                            }
                            alt={
                                team[
                                    teamIndex
                                ].name
                            }
                        />

                        <h5>
                            {
                                team[
                                    teamIndex
                                ].name
                            }
                        </h5>

                        <p>
                            {
                                team[
                                    teamIndex
                                ].role
                            }
                        </p>

                        <p>
                            ID:
                            {
                                team[
                                    teamIndex
                                ].instagram
                            }

                            {' '}

                            PH:
                            {
                                team[
                                    teamIndex
                                ].phone
                            }
                        </p>
                    </div>

                    {/* TEAM DOTS */}

                    <div className="team-dots">

                        {team.map(
                            (_, i) => (
                                <button
                                    key={i}
                                    className={
                                        i ===
                                        teamIndex
                                            ? 'dot active'
                                            : 'dot'
                                    }
                                    onClick={() =>
                                        setTeamIndex(
                                            i
                                        )
                                    }
                                    aria-label={`Show ${team[i].name}`}
                                />
                            )
                        )}

                    </div>

                </div>
            </div>

            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {sent ? (

                <div className="success">

                    <CheckCircle2
                        size={52}
                    />

                    <h3>
                        Your enquiry is on
                        its way!
                    </h3>

                    {bookingRef && (
                        <p
                            style={{
                                fontWeight: 600,
                                color: '#38a169',
                            }}
                        >
                            Reference ID:{' '}
                            {bookingRef}
                        </p>
                    )}

                    <p>
                        We’ll get back to
                        you shortly with
                        the perfect
                        itinerary.
                    </p>

                    <Button
                        onClick={() => {
                            setSent(false);
                            setBookingRef('');
                            setErrors({});
                        }}
                    >
                        Send another
                    </Button>

                </div>

            ) : (

                /* =================================================
                   BOOKING FORM
                ================================================= */

                <form
                    onSubmit={submit}
                    noValidate
                >

                    <h4>
                        Plan your escape
                    </h4>

                    {/* GENERAL ERROR */}

                    {errors.form && (
                        <p
                            className="form-error"
                            style={{
                                color: '#e53e3e',
                                marginBottom:
                                    '1rem',
                            }}
                        >
                            {errors.form}
                        </p>
                    )}

                    <div className="form-grid">

                        {/* NAME */}

                        <Field
                            label="Your name *"
                            name="name"
                            placeholder="Arun Kumar"
                            required
                            error={
                                errors.name
                            }
                        />

                        {/* EMAIL */}

                        <Field
                            label="Email address (optional)"
                            name="email"
                            type="email"
                            placeholder="you@email.com"
                            error={
                                errors.email
                            }
                        />

                        {/* PHONE */}

                        <Field
                            label="Phone number *"
                            name="phone"
                            placeholder="98******10"
                            required
                            error={
                                errors.phone
                            }
                        />

                        {/* DESTINATION */}

                        <label>
                            Destination *

                            <select
                                name="destination"
                                defaultValue=""
                                required
                            >
                                <option
                                    value=""
                                    disabled
                                >
                                    Choose a place
                                </option>

                                <option value="Dandeli">
                                    Dandeli
                                </option>

                                <option value="munnar">
                                    Munnar
                                </option>

                                <option value="coorg">
                                    Coorg
                                </option>

                                <option value="ooty">
                                    Ooty
                                </option>

                                <option value="wayanad">
                                    Wayanad
                                </option>

                                <option value="other">
                                    Other
                                </option>
                            </select>

                            {errors.destination && (
                                <small
                                    style={{
                                        color:
                                            '#e53e3e',
                                    }}
                                >
                                    {
                                        errors.destination
                                    }
                                </small>
                            )}
                        </label>

                        {/* CATEGORY */}

                        <label>
                            Group Type /
                            Category *

                            <select
                                name="category"
                                defaultValue=""
                                required
                            >
                                <option
                                    value=""
                                    disabled
                                >
                                    Choose group
                                    type
                                </option>

                                <option value="School">
                                    School
                                </option>

                                <option value="College">
                                    College
                                </option>

                                <option value="Staff">
                                    Staff
                                </option>

                                <option value="Family">
                                    Family
                                </option>

                                <option value="Bachelors">
                                    Bachelors
                                </option>
                            </select>

                            {errors.category && (
                                <small
                                    style={{
                                        color:
                                            '#e53e3e',
                                    }}
                                >
                                    {
                                        errors.category
                                    }
                                </small>
                            )}
                        </label>

                        {/* TRAVELLERS */}

                        <Field
                            label="Travellers *"
                            name="travellers"
                            type="number"
                            min="1"
                            max="50"
                            defaultValue="2"
                            required
                            error={
                                errors.travellers
                            }
                        />

                        {/* TRAVEL DATE */}

                        <Field
                            label="Travel date"
                            name="travelDate"
                            type="date"
                        />

                    </div>

                    {/* SUBMIT */}

                    <Button
                        type="submit"
                        disabled={
                            submitting
                        }
                    >
                        {submitting
                            ? 'Sending enquiry...'
                            : 'Send enquiry'}
                    </Button>

                </form>
            )}

        </section>
    );
}