-- Grades Portal: run once in Supabase → SQL Editor.
-- Tables are locked (RLS on, no policies); all access goes through the functions below.
create extension if not exists pgcrypto with schema extensions;

create table if not exists gp_settings (id int primary key default 1 check (id = 1), admin_hash text);
create table if not exists gp_students (neptun text primary key, name text not null, pin text not null);
create table if not exists gp_exams (id serial primary key, title text not null, exam_date date not null default current_date);
create table if not exists gp_grades (
  exam_id int references gp_exams(id) on delete cascade,
  neptun text references gp_students(neptun) on delete cascade,
  grade text not null,
  primary key (exam_id, neptun));
alter table gp_settings enable row level security;
alter table gp_students enable row level security;
alter table gp_exams enable row level security;
alter table gp_grades enable row level security;

-- First call ever sets the lecturer password; afterwards it checks it.
create or replace function gp_admin_ok(pw text) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare h text;
begin
  select admin_hash into h from gp_settings where id = 1;
  if h is null then
    if length(pw) < 6 then raise exception 'Password must be at least 6 characters'; end if;
    insert into gp_settings(id, admin_hash) values (1, crypt(pw, gen_salt('bf')))
      on conflict (id) do update set admin_hash = excluded.admin_hash;
    return true;
  end if;
  return h = crypt(pw, h);
end $$;

create or replace function gp_require_admin(pw text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not gp_admin_ok(pw) then raise exception 'Wrong lecturer password'; end if;
end $$;

create or replace function gp_admin_data(pw text) returns json
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform gp_require_admin(pw);
  return json_build_object(
    'students', coalesce((select json_agg(s order by s.name) from gp_students s), '[]'),
    'exams', coalesce((select json_agg(e order by e.exam_date desc, e.id desc) from gp_exams e), '[]'),
    'grades', coalesce((select json_agg(g) from gp_grades g), '[]'));
end $$;

-- rows: [{neptun, name}] ; new students get a random 6-char PIN, existing keep theirs.
create or replace function gp_upsert_students(pw text, rows jsonb) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform gp_require_admin(pw);
  insert into gp_students(neptun, name, pin)
  select upper(trim(r->>'neptun')), trim(r->>'name'),
         upper(substr(translate(encode(gen_random_bytes(9), 'base64'), '+/=0O1Il', ''), 1, 6))
  from jsonb_array_elements(rows) r
  where coalesce(trim(r->>'neptun'), '') <> ''
  on conflict (neptun) do update set name = excluded.name;
end $$;

create or replace function gp_delete_student(pw text, code text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform gp_require_admin(pw);
  delete from gp_students where neptun = upper(code);
end $$;

-- grades: [{neptun, grade}]
create or replace function gp_save_exam(pw text, title text, d date, grades jsonb) returns int
language plpgsql security definer set search_path = public, extensions as $$
declare eid int;
begin
  perform gp_require_admin(pw);
  insert into gp_exams(title, exam_date) values (title, d) returning id into eid;
  insert into gp_grades(exam_id, neptun, grade)
  select eid, upper(g->>'neptun'), trim(g->>'grade') from jsonb_array_elements(grades) g
  where coalesce(trim(g->>'grade'), '') <> ''
    and exists (select 1 from gp_students s where s.neptun = upper(g->>'neptun'));
  return eid;
end $$;

create or replace function gp_delete_exam(pw text, eid int) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform gp_require_admin(pw);
  delete from gp_exams where id = eid;
end $$;

create or replace function gp_change_password(pw text, new_pw text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform gp_require_admin(pw);
  if length(new_pw) < 6 then raise exception 'Password must be at least 6 characters'; end if;
  update gp_settings set admin_hash = crypt(new_pw, gen_salt('bf')) where id = 1;
end $$;

-- Student view: only their own grades.
create or replace function gp_student_grades(code text, p text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare s gp_students;
begin
  select * into s from gp_students where neptun = upper(trim(code)) and pin = upper(trim(p));
  if not found then perform pg_sleep(1); raise exception 'Wrong Neptun code or password'; end if;
  return json_build_object('name', s.name, 'grades', coalesce((
    select json_agg(json_build_object('title', e.title, 'date', e.exam_date, 'grade', g.grade)
                    order by e.exam_date desc, e.id desc)
    from gp_grades g join gp_exams e on e.id = g.exam_id where g.neptun = s.neptun), '[]'));
end $$;

revoke all on function gp_require_admin(text) from public, anon, authenticated;
