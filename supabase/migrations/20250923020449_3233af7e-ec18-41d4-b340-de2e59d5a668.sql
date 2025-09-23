-- Fix security linter issue: Remove the security definer view
-- Views with security definer can bypass user-level security policies
-- Replace with secure functions that properly enforce access control

DROP VIEW IF EXISTS public.person_directory;