import { useState, useEffect } from 'react';
import { CheckCircle2, Globe, Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import { FaInstagram,FaWhatsapp } from "react-icons/fa";
import Button from '../common/Button.jsx';
import Field from '../common/Field.jsx';
import { team } from '../../data/team.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ContactSection() {
    const [teamIndex, setTeamIndex] = useState(0);
    const [sent, setSent] = useState(false);
    const [bookingRef, setBookingRef] = useState('');
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
    useEffect(() => {
        const timer = setInterval(() => {
            setTeamIndex((prev) => (prev + 1) % team.length);
        }, 3500);
        return () => clearInterval(timer);
    }, []);

    async function submit(event) {
        event.preventDefault();
        setErrors({});
        setSubmitting(true);

        const formElement = event.currentTarget;
        const rawData = Object.fromEntries(new FormData(formElement));

        const payload = {
            name: rawData.name?.trim(),
            email: rawData.email?.trim() || null,
            phone: rawData.phone?.trim(),
            destination: rawData.destination,
            category: rawData.category || 'Standard Package',
            travellers: Number(rawData.travellers),
            travelDate: rawData.travelDate || null
        };

        try {
            const response = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok && result.ok) {
                setBookingRef(result.data?.bookingReference || '');
                setSent(true);
                formElement.reset();
            } else {
                setErrors(result.errors || { form: result.message || 'Validation error. Please check your fields.' });
            }
        } catch {
            setErrors({ form: 'Unable to send your enquiry right now. Please check your connection or call us.' });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section id="contact" className="booking section dark">
            <div>
                <p className="eyebrow">READY FOR YOUR</p>
                <h3>NEXT JOURNEY?</h3>
                <p>Let Shadow Tour Packages be a part of your next adventure.</p>

                <div className="contact-details">
                    <span><Phone />+91 9447319218</span>
                    <span><Mail />shadowtourpackagesknr@gmail.com</span>
                    <span>
                        <FaWhatsapp size={24} />
                        <a href={`https://wa.me/${phoneNumber}?text=Hi,I am here for Booking Enquiry`} target="_blank" rel="noopener noreferrer">
                            Click to Chat on WhatsApp
                        </a>
                    </span>
                    <span>
                        <FaInstagram size={24} />
                        <a href="https://www.instagram.com/shadow_tour_packages/" target="_blank" rel="noopener noreferrer">
                            shadow_tour_packages
                        </a>
                    </span>
                    <span>
                        <MapPin />
                        <pre>Shadow Tour Packages<br />   <b>KELAKAM</b><br />KANNUR KERALA 670674</pre>
                    </span>
                </div>

                <div className="team-carousel reveal">
                    <div className="team-slide animate-slide" key={teamIndex}>
                        <img src={team[teamIndex].image} alt={team[teamIndex].name} />
                        <h5>{team[teamIndex].name}</h5>
                        <p>{team[teamIndex].role}</p>
                        <p>ID:{team[teamIndex].instagram} PH: {team[teamIndex].phone}</p>
                    </div>

                    <div className="team-dots">
                        {team.map((_, i) => (
                            <button
                                key={i}
                                className={i === teamIndex ? 'dot active' : 'dot'}
                                onClick={() => setTeamIndex(i)}
                                aria-label={`Show ${team[i].name}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {sent ? (
                <div className="success">
                    <CheckCircle2 size={52} />
                    <h3>Your enquiry is on its way!</h3>
                    {bookingRef && <p style={{ fontWeight: 600, color: '#38a169' }}>Reference ID: {bookingRef}</p>}
                    <p>We’ll get back to you shortly with the perfect itinerary.</p>
                    <Button onClick={() => setSent(false)}>Send another</Button>
                </div>
            ) : (
                <form onSubmit={submit}>
                    <h4>Plan your escape</h4>
                    {errors.form && <p className="form-error" style={{ color: '#e53e3e', marginBottom: '1rem' }}>{errors.form}</p>}
                    <div className="form-grid">
                        <Field label="Your name *" name="name" placeholder="Arun Kumar" required error={errors.name} />
                        <Field label="Email address (optional)" name="email" type="email" placeholder="you@email.com" error={errors.email} />
                        <Field label="Phone number *" name="phone" placeholder="98******10" required error={errors.phone} />

                        <label>
                            Destination *
                            <select name="destination" defaultValue="" required>
                                <option value="" disabled>Choose a place</option>
                                <option value="Dandeli">Dandeli</option>
                                <option value="munnar">Munnar</option>
                                <option value="coorg">Coorg</option>
                                <option value="ooty">Ooty</option>
                                <option value="wayanad">Wayanad</option>
                                <option value="other">Other</option>
                            </select>
                            {errors.destination && <small style={{ color: '#e53e3e' }}>{errors.destination}</small>}
                        </label>

                        <label>
                            Group Type / Category *
                            <select name="category" defaultValue="" required>
                                <option value="" disabled>Choose group type</option>
                                <option value="School">School</option>
                                <option value="College">College</option>
                                <option value="Staff">Staff</option>
                                <option value="Family">Family</option>
                                <option value="Bachelors">Bachelors</option>
                            </select>
                            {errors.category && <small style={{ color: '#e53e3e' }}>{errors.category}</small>}
                        </label>

                        <Field label="Travellers *" name="travellers" type="number" min="1" max="50" defaultValue="2" required error={errors.travellers} />
                        <Field label="Travel date" name="travelDate" type="date" />
                    </div>
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Sending enquiry...' : 'Send enquiry'}
                    </Button>
                </form>
            )}
        </section>
    );
}