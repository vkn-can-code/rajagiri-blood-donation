// src/pages/public/ContactUs.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './ContactUs.module.css';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

// --- UTILS: Reveal Component (Reused) ---
const Reveal = ({ children, delay = 0, className = "" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.15 });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`${styles.reveal} ${isVisible ? styles.visible : ''} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

const ContactUs = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            // Reset "submitted" message after 5 seconds if desired, but leaving it as confirmation state is fine.
        }, 1000);
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                {/* HERO */}
                <section className={styles.heroSection}>
                    <Reveal>
                        <h1 className={styles.heroTitle}>
                            Get in <span className={styles.gradientText}>Touch</span>
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Have questions about donating? Want to organize a camp? We're here to help you save lives.
                        </p>
                    </Reveal>
                </section>

                {/* CONTENT GRID */}
                <div className={styles.contactGrid}>

                    {/* LEFT: INFO CARDS */}
                    <div className={styles.infoColumn}>
                        <Reveal delay={100}>
                            <div className={styles.infoCard}>
                                <div className={styles.iconBox}><Mail size={24} /></div>
                                <div className={styles.infoContent}>
                                    <h4>Email Us</h4>
                                    <p><a href="mailto:support@rlyfe.org">support@rlyfe.org</a></p>
                                    <p><a href="mailto:volunteers@rlyfe.org">volunteers@rlyfe.org</a></p>
                                </div>
                            </div>
                        </Reveal>

                        <Reveal delay={200}>
                            <div className={styles.infoCard}>
                                <div className={styles.iconBox}><Phone size={24} /></div>
                                <div className={styles.infoContent}>
                                    <h4>Call Us</h4>
                                    <p><a href="tel:+919876543210">+91 98765 43210</a></p>
                                    <p>Mon-Sat, 9am - 6pm</p>
                                </div>
                            </div>
                        </Reveal>

                        <Reveal delay={300}>
                            <div className={styles.infoCard}>
                                <div className={styles.iconBox}><MapPin size={24} /></div>
                                <div className={styles.infoContent}>
                                    <h4>Visit Us</h4>
                                    <p>Rajagiri College of Social Sciences</p>
                                    <p>Kalamassery, Kochi, Kerala</p>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    {/* RIGHT: CONTACT FORM */}
                    <Reveal delay={400}>
                        <div className={styles.formCard}>
                            {submitted ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                    <CheckCircle size={64} className="text-emerald-500" style={{ margin: '0 auto 1.5rem', color: 'var(--primary)' }} />
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Message Sent!</h3>
                                    <p style={{ color: 'var(--text-secondary)' }}>Thank you for reaching out. We'll get back to you shortly.</p>
                                    <button
                                        className={styles.submitBtn}
                                        style={{ marginTop: '2rem', width: 'auto', padding: '12px 24px' }}
                                        onClick={() => setSubmitted(false)}
                                    >
                                        Send Another
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <h3 className={styles.formTitle}>Send a Message</h3>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Your Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className={styles.input}
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className={styles.input}
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            className={styles.input}
                                            placeholder="How can we help?"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Message</label>
                                        <textarea
                                            name="message"
                                            className={styles.textarea}
                                            placeholder="Write your message here..."
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                        ></textarea>
                                    </div>

                                    <button type="submit" className={styles.submitBtn}>
                                        Send Message <Send size={18} />
                                    </button>
                                </form>
                            )}
                        </div>
                    </Reveal>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
