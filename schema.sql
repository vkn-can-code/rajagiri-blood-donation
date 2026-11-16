--
-- PostgreSQL database dump
---- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_BloodRequests_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_BloodRequests_status" AS ENUM (
    'open',
    'fulfilled',
    'closed'
);


ALTER TYPE public."enum_BloodRequests_status" OWNER TO postgres;

--
-- Name: enum_CampRegistrations_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_CampRegistrations_status" AS ENUM (
    'pending',
    'approved',
    'rejected',
    'auto_rejected'
);


ALTER TYPE public."enum_CampRegistrations_status" OWNER TO postgres;

--
-- Name: enum_Donations_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Donations_status" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public."enum_Donations_status" OWNER TO postgres;

--
-- Name: enum_Notifications_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Notifications_type" AS ENUM (
    'info',
    'warning',
    'success',
    'error'
);


ALTER TYPE public."enum_Notifications_type" OWNER TO postgres;

--
-- Name: enum_RequestResponses_certificate_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_RequestResponses_certificate_status" AS ENUM (
    'none',
    'uploaded',
    'granted'
);


ALTER TYPE public."enum_RequestResponses_certificate_status" OWNER TO postgres;

--
-- Name: enum_RequestResponses_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_RequestResponses_status" AS ENUM (
    'new',
    'contacted'
);


ALTER TYPE public."enum_RequestResponses_status" OWNER TO postgres;

--
-- Name: enum_Users_gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Users_gender" AS ENUM (
    'male',
    'female',
    'other'
);


ALTER TYPE public."enum_Users_gender" OWNER TO postgres;

--
-- Name: enum_Users_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Users_role" AS ENUM (
    'student',
    'faculty',
    'volunteer',
    'non_teaching',
    'admin',
    'super_admin',
    'faculty_admin'
);


ALTER TYPE public."enum_Users_role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Batches" (
    id integer NOT NULL,
    batch_name character varying(255) NOT NULL,
    department_id integer,
    class_tutor_id integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Batches" OWNER TO postgres;

--
-- Name: Batches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Batches_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Batches_id_seq" OWNER TO postgres;

--
-- Name: Batches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Batches_id_seq" OWNED BY public."Batches".id;


--
-- Name: BloodRequests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BloodRequests" (
    id integer NOT NULL,
    requester_id integer NOT NULL,
    patient_name character varying(255) NOT NULL,
    hospital_name character varying(255) NOT NULL,
    required_blood_group character varying(3) NOT NULL,
    units_required integer NOT NULL,
    status public."enum_BloodRequests_status" DEFAULT 'open'::public."enum_BloodRequests_status" NOT NULL,
    patient_age integer,
    patient_id character varying(255),
    reason text,
    bystander_name character varying(255),
    bystander_number character varying(255),
    required_date date,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    google_maps_link character varying(255)
);


ALTER TABLE public."BloodRequests" OWNER TO postgres;

--
-- Name: BloodRequests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."BloodRequests_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."BloodRequests_id_seq" OWNER TO postgres;

--
-- Name: BloodRequests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."BloodRequests_id_seq" OWNED BY public."BloodRequests".id;


--
-- Name: CampRegistrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CampRegistrations" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    camp_id integer NOT NULL,
    status public."enum_CampRegistrations_status" DEFAULT 'pending'::public."enum_CampRegistrations_status" NOT NULL,
    weight_over_45 boolean,
    already_donated boolean,
    major_surgery boolean,
    on_medication boolean,
    tattoo_piercing boolean,
    consumed_alcohol boolean,
    dental_work boolean,
    pregnant_breastfeeding boolean,
    history_disease boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."CampRegistrations" OWNER TO postgres;

--
-- Name: CampRegistrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CampRegistrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CampRegistrations_id_seq" OWNER TO postgres;

--
-- Name: CampRegistrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CampRegistrations_id_seq" OWNED BY public."CampRegistrations".id;


--
-- Name: Camps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Camps" (
    id integer NOT NULL,
    title character varying(255),
    location text,
    address text,
    camp_date timestamp with time zone,
    latitude double precision,
    longitude double precision,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    google_maps_link text
);


ALTER TABLE public."Camps" OWNER TO postgres;

--
-- Name: Camps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Camps_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Camps_id_seq" OWNER TO postgres;

--
-- Name: Camps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Camps_id_seq" OWNED BY public."Camps".id;


--
-- Name: Departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Departments" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    head_faculty_id integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Departments" OWNER TO postgres;

--
-- Name: Departments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Departments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Departments_id_seq" OWNER TO postgres;

--
-- Name: Departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Departments_id_seq" OWNED BY public."Departments".id;


--
-- Name: Donations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Donations" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    camp_id integer,
    donation_date date NOT NULL,
    certificate_url character varying(255) NOT NULL,
    status public."enum_Donations_status" DEFAULT 'pending'::public."enum_Donations_status" NOT NULL,
    description text,
    rejection_reason text,
    blood_request_id integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Donations" OWNER TO postgres;

--
-- Name: Donations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Donations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Donations_id_seq" OWNER TO postgres;

--
-- Name: Donations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Donations_id_seq" OWNED BY public."Donations".id;


--
-- Name: Donors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Donors" (
    user_id integer NOT NULL,
    blood_group character varying(255),
    date_of_birth date,
    last_donation_date date,
    is_available boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Donors" OWNER TO postgres;

--
-- Name: EmailLogs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmailLogs" (
    id integer NOT NULL,
    recipient_email character varying(255),
    subject character varying(255),
    body_html text,
    status character varying(255),
    scheduled_at timestamp with time zone,
    sent_at timestamp with time zone,
    error_message text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."EmailLogs" OWNER TO postgres;

--
-- Name: EmailLogs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."EmailLogs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."EmailLogs_id_seq" OWNER TO postgres;

--
-- Name: EmailLogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."EmailLogs_id_seq" OWNED BY public."EmailLogs".id;


--
-- Name: Notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notifications" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    message text NOT NULL,
    type public."enum_Notifications_type" DEFAULT 'info'::public."enum_Notifications_type",
    is_read boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Notifications" OWNER TO postgres;

--
-- Name: Notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Notifications_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Notifications_id_seq" OWNER TO postgres;

--
-- Name: Notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Notifications_id_seq" OWNED BY public."Notifications".id;


--
-- Name: RequestResponses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RequestResponses" (
    id integer NOT NULL,
    request_id integer NOT NULL,
    responder_id integer NOT NULL,
    message text,
    contact_details character varying(255),
    status character varying(255) DEFAULT 'new'::public."enum_RequestResponses_status" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    reason character varying(255)
);


ALTER TABLE public."RequestResponses" OWNER TO postgres;

--
-- Name: RequestResponses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."RequestResponses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."RequestResponses_id_seq" OWNER TO postgres;

--
-- Name: RequestResponses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."RequestResponses_id_seq" OWNED BY public."RequestResponses".id;


--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO postgres;

--
-- Name: SystemSettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SystemSettings" (
    id integer NOT NULL,
    key character varying(255),
    value text,
    type character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."SystemSettings" OWNER TO postgres;

--
-- Name: SystemSettings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."SystemSettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SystemSettings_id_seq" OWNER TO postgres;

--
-- Name: SystemSettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."SystemSettings_id_seq" OWNED BY public."SystemSettings".id;


--
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Users" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone_number character varying(255),
    password_hash character varying(255) NOT NULL,
    role public."enum_Users_role" NOT NULL,
    batch_id integer,
    blood_group character varying(5),
    height double precision,
    weight double precision,
    gender public."enum_Users_gender",
    student_id character varying(255),
    address text,
    has_donated boolean DEFAULT false,
    last_donation_date date,
    badges json DEFAULT '[]'::json,
    permissions json DEFAULT '{}'::json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    is_first_login boolean DEFAULT true NOT NULL,
    reset_token character varying(255),
    reset_token_expires timestamp with time zone
);


ALTER TABLE public."Users" OWNER TO postgres;

--
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Users_id_seq" OWNER TO postgres;

--
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public."Users".id;


--
-- Name: Batches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Batches" ALTER COLUMN id SET DEFAULT nextval('public."Batches_id_seq"'::regclass);


--
-- Name: BloodRequests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BloodRequests" ALTER COLUMN id SET DEFAULT nextval('public."BloodRequests_id_seq"'::regclass);


--
-- Name: CampRegistrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CampRegistrations" ALTER COLUMN id SET DEFAULT nextval('public."CampRegistrations_id_seq"'::regclass);


--
-- Name: Camps id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Camps" ALTER COLUMN id SET DEFAULT nextval('public."Camps_id_seq"'::regclass);


--
-- Name: Departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Departments" ALTER COLUMN id SET DEFAULT nextval('public."Departments_id_seq"'::regclass);


--
-- Name: Donations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Donations" ALTER COLUMN id SET DEFAULT nextval('public."Donations_id_seq"'::regclass);


--
-- Name: EmailLogs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailLogs" ALTER COLUMN id SET DEFAULT nextval('public."EmailLogs_id_seq"'::regclass);


--
-- Name: Notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications" ALTER COLUMN id SET DEFAULT nextval('public."Notifications_id_seq"'::regclass);


--
-- Name: RequestResponses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestResponses" ALTER COLUMN id SET DEFAULT nextval('public."RequestResponses_id_seq"'::regclass);


--
-- Name: SystemSettings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SystemSettings" ALTER COLUMN id SET DEFAULT nextval('public."SystemSettings_id_seq"'::regclass);


--
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- Data for Name: Batches; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: BloodRequests; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: CampRegistrations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Camps; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Departments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Donations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Donors; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: EmailLogs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: RequestResponses; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SequelizeMeta" (name) FROM stdin;
20251011061800-create-user.js
20251011073051-create-donor.js
20251011081522-create-camp.js
20251011083856-create-blood-request.js
20251011095907-add-roles-and-faculty-link-to-users.js
20251015062619-create-donation.js
20251116072903-create-batch.js
20251116072947-add-batch-id-to-users.js
20251116073249-fix-user-roles-enum.js
20251116132917-add-coords-to-camps.js
YYYYMMDDHHMMSS-create-notification.js
20251117000000-add-notes-to-donations.js
20251117100000-update-admin-features.js
20251118000000-add-blood-group-to-users.js
20251119000000-update-admin-features.js
20251120000000-update-blood-requests.js
20251201000000-add-coords-to-requests.js
20260106000000-rlyfe-2-update.js
20260118000000-create-department.js
20260118000001-update-batch.js
20260121000001-add-class-tutor-to-batch.js
20260206000000-add-patient-age.js
20260206061958-add-certificate-to-request-response.js
20260310040325-create-email-log.js
20260310235959-add-reason-to-responses.js
20260531230000-add-google-maps-link-to-requests.js
20260531183139-add-faculty-admin-role.js
20260601061419-create-system-setting.js
20260601063014-add-google-maps-link-to-camps.js
20260607182848-create-camp-registration.js
20260630000001-add-is-first-login-to-users.js
20260630000002-add-reset-token-to-users.js
\.


--
-- Data for Name: SystemSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: Batches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Batches_id_seq"', 5, true);


--
-- Name: BloodRequests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."BloodRequests_id_seq"', 12, true);


--
-- Name: CampRegistrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CampRegistrations_id_seq"', 3, true);


--
-- Name: Camps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Camps_id_seq"', 5, true);


--
-- Name: Departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Departments_id_seq"', 2, true);


--
-- Name: Donations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Donations_id_seq"', 4, true);


--
-- Name: EmailLogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."EmailLogs_id_seq"', 26, true);


--
-- Name: Notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Notifications_id_seq"', 10, true);


--
-- Name: RequestResponses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."RequestResponses_id_seq"', 9, true);


--
-- Name: SystemSettings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."SystemSettings_id_seq"', 1, true);


--
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Users_id_seq"', 15, true);


--
-- Name: Batches Batches_batch_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Batches"
    ADD CONSTRAINT "Batches_batch_name_key" UNIQUE (batch_name);


--
-- Name: Batches Batches_batch_name_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Batches"
    ADD CONSTRAINT "Batches_batch_name_key1" UNIQUE (batch_name);


--
-- Name: Batches Batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Batches"
    ADD CONSTRAINT "Batches_pkey" PRIMARY KEY (id);


--
-- Name: BloodRequests BloodRequests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BloodRequests"
    ADD CONSTRAINT "BloodRequests_pkey" PRIMARY KEY (id);


--
-- Name: CampRegistrations CampRegistrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CampRegistrations"
    ADD CONSTRAINT "CampRegistrations_pkey" PRIMARY KEY (id);


--
-- Name: Camps Camps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Camps"
    ADD CONSTRAINT "Camps_pkey" PRIMARY KEY (id);


--
-- Name: Departments Departments_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Departments"
    ADD CONSTRAINT "Departments_name_key" UNIQUE (name);


--
-- Name: Departments Departments_name_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Departments"
    ADD CONSTRAINT "Departments_name_key1" UNIQUE (name);


--
-- Name: Departments Departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Departments"
    ADD CONSTRAINT "Departments_pkey" PRIMARY KEY (id);


--
-- Name: Donations Donations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Donations"
    ADD CONSTRAINT "Donations_pkey" PRIMARY KEY (id);


--
-- Name: Donors Donors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Donors"
    ADD CONSTRAINT "Donors_pkey" PRIMARY KEY (user_id);


--
-- Name: EmailLogs EmailLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailLogs"
    ADD CONSTRAINT "EmailLogs_pkey" PRIMARY KEY (id);


--
-- Name: Notifications Notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "Notifications_pkey" PRIMARY KEY (id);


--
-- Name: RequestResponses RequestResponses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestResponses"
    ADD CONSTRAINT "RequestResponses_pkey" PRIMARY KEY (id);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: SystemSettings SystemSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_email_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key1" UNIQUE (email);


--
-- Name: Users Users_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_phone_number_key" UNIQUE (phone_number);


--
-- Name: Users Users_phone_number_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_phone_number_key1" UNIQUE (phone_number);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: Batches Batches_class_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Batches"
    ADD CONSTRAINT "Batches_class_tutor_id_fkey" FOREIGN KEY (class_tutor_id) REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: Batches Batches_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Batches"
    ADD CONSTRAINT "Batches_department_id_fkey" FOREIGN KEY (department_id) REFERENCES public."Departments"(id) ON UPDATE CASCADE;


--
-- Name: BloodRequests BloodRequests_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BloodRequests"
    ADD CONSTRAINT "BloodRequests_requester_id_fkey" FOREIGN KEY (requester_id) REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: CampRegistrations CampRegistrations_camp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CampRegistrations"
    ADD CONSTRAINT "CampRegistrations_camp_id_fkey" FOREIGN KEY (camp_id) REFERENCES public."Camps"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CampRegistrations CampRegistrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CampRegistrations"
    ADD CONSTRAINT "CampRegistrations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Departments Departments_head_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Departments"
    ADD CONSTRAINT "Departments_head_faculty_id_fkey" FOREIGN KEY (head_faculty_id) REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: Donations Donations_blood_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Donations"
    ADD CONSTRAINT "Donations_blood_request_id_fkey" FOREIGN KEY (blood_request_id) REFERENCES public."BloodRequests"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Donations Donations_camp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Donations"
    ADD CONSTRAINT "Donations_camp_id_fkey" FOREIGN KEY (camp_id) REFERENCES public."Camps"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Donations Donations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Donations"
    ADD CONSTRAINT "Donations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: Notifications Notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "Notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: RequestResponses RequestResponses_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestResponses"
    ADD CONSTRAINT "RequestResponses_request_id_fkey" FOREIGN KEY (request_id) REFERENCES public."BloodRequests"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RequestResponses RequestResponses_responder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestResponses"
    ADD CONSTRAINT "RequestResponses_responder_id_fkey" FOREIGN KEY (responder_id) REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: Users Users_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_batch_id_fkey" FOREIGN KEY (batch_id) REFERENCES public."Batches"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Kzj1FL9OXBgiYqBaEs7K3TaDs8MsarFkVhg2uVTXoxAPkp916rbXrdaeuzPoXa4

