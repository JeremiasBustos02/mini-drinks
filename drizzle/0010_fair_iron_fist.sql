CREATE OR REPLACE FUNCTION public.handle_new_customer_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.customer_profiles ("auth_user_id", "display_name")
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(pg_catalog.btrim(NEW.raw_user_meta_data ->> 'display_name'), ''),
      pg_catalog.split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT ("auth_user_id") DO NOTHING;

  RETURN NEW;
END;
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.handle_new_customer_profile() FROM PUBLIC;--> statement-breakpoint
CREATE TRIGGER on_auth_user_created_customer_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_customer_profile();--> statement-breakpoint
INSERT INTO public.customer_profiles ("auth_user_id", "display_name")
SELECT
  users.id,
  COALESCE(
    NULLIF(pg_catalog.btrim(users.raw_user_meta_data ->> 'display_name'), ''),
    pg_catalog.split_part(users.email, '@', 1)
  )
FROM auth.users AS users
WHERE NOT EXISTS (
  SELECT 1
  FROM public.admin_users AS admins
  WHERE admins.auth_user_id = users.id
)
ON CONFLICT ("auth_user_id") DO NOTHING;
