--table definitions

CREATE TABLE IF NOT EXISTS public.role
(
    id bigserial NOT NULL,
    name character varying(64) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT role_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.user_address
(
    id bigserial NOT NULL,
    postal_code character varying(32) COLLATE pg_catalog."default",
    country character varying(128) COLLATE pg_catalog."default",
    state character varying(128) COLLATE pg_catalog."default",
    city bit varying(128),
    address character varying(256) COLLATE pg_catalog."default",
    CONSTRAINT user_address_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public."user"
(
    id bigserial NOT NULL,
    email character varying(64) COLLATE pg_catalog."default" NOT NULL,
    display_name character varying(256) COLLATE pg_catalog."default" NOT NULL,
    password_hash character varying(128) COLLATE pg_catalog."default" NOT NULL,
    address_id bigint,
    CONSTRAINT user_pkey PRIMARY KEY (id),
    CONSTRAINT user__email_unique UNIQUE (email),
    CONSTRAINT user__address_fkey FOREIGN KEY (address_id)
        REFERENCES public.user_address (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE IF NOT EXISTS public.user_role
(
    role_id bigint NOT NULL,
    user_id bigint NOT NULL,
    CONSTRAINT user_role_pkey PRIMARY KEY (role_id, user_id),
    CONSTRAINT user_role__role_fkey FOREIGN KEY (role_id)
        REFERENCES public.role (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT user_role__user_fkey FOREIGN KEY (user_id)
        REFERENCES public."user" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.unit
(
    id bigserial NOT NULL,
    name character varying(64) COLLATE pg_catalog."default" NOT NULL,
    address text,
    phone character varying(32) COLLATE pg_catalog."default",
    CONSTRAINT unit_pkey PRIMARY KEY (id),
    CONSTRAINT unit__address_fkey FOREIGN KEY (address_id)
        REFERENCES public.unit_address (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.provider
(
    id bigserial NOT NULL,
    name character varying(256) COLLATE pg_catalog."default",
    user_id bigint,
    CONSTRAINT provider_pkey PRIMARY KEY (id),
    CONSTRAINT provider__user_fkey FOREIGN KEY (user_id)
        REFERENCES public."user" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.course
(
    id bigserial NOT NULL,
    provider_id bigint,
    name character varying(256) COLLATE pg_catalog."default" NOT NULL,
    duration_months integer,
    hours integer,
    url character varying(1024) COLLATE pg_catalog."default",
    is_available boolean NOT NULL DEFAULT false,
    degree character varying(128) COLLATE pg_catalog."default",
    qualification character varying(128) COLLATE pg_catalog."default",
    style character varying(64) COLLATE pg_catalog."default" NOT NULL,
    is_highlighted boolean NOT NULL DEFAULT false,
    CONSTRAINT course_pkey PRIMARY KEY (id),
    CONSTRAINT url_unique UNIQUE (url)
);

CREATE TABLE IF NOT EXISTS public.course_unit
(
    unit_id bigint NOT NULL,
    course_id bigint NOT NULL,
    CONSTRAINT course_unit_pkey PRIMARY KEY (unit_id, course_id),
    CONSTRAINT course_unit__course_fkey FOREIGN KEY (course_id)
        REFERENCES public.course (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT course_unit__unit_fkey FOREIGN KEY (unit_id)
        REFERENCES public.unit (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.active_process
(
    id bigserial NOT NULL,
    type character varying(256) COLLATE pg_catalog."default" NOT NULL,
    data jsonb,
    meta jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT active_process_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.defaults
(
    key character varying(64) COLLATE pg_catalog."default" NOT NULL,
    value text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT defaults_pkey PRIMARY KEY (key)
);