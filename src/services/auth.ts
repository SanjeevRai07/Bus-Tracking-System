import { supabase } from "@/lib/supabase";

export async function loginStudent(email: string, password: string) {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .single();

  return { data, error };
}