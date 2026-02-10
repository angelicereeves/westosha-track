"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "documents";

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient();


  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "Other");
  const description = String(formData.get("description") || "").trim();
  const isRequired = formData.get("is_required") === "on";
  const file = formData.get("file") as File | null;

  if (!title) throw new Error("Title is required.");
  if (!file) throw new Error("File is required.");

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) throw new Error("Not authenticated.");

  // Unique storage path
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
  const storagePath = `coach_uploads/${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;

  // Upload to Storage
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadErr) throw uploadErr;

  // Insert DB row
  const { error: insertErr } = await supabase.from("documents").insert({
    title,
    category,
    description: description || null,
    is_required: isRequired,
    file_path: storagePath,
    file_name: file.name,
    mime_type: file.type || null,
    file_size: file.size,
    created_by: user.id,
  });

  if (insertErr) {
    // cleanup if DB insert fails
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw insertErr;
  }

  revalidatePath("/coach/docs");
}

export async function downloadDocument(filePath: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 60);

  if (error) throw error;
  redirect(data.signedUrl);
}

export async function deleteDocument(docId: string, filePath: string) {
  const supabase = await createClient();

  const { error: dbErr } = await supabase.from("documents").delete().eq("id", docId);
  if (dbErr) throw dbErr;

  const { error: storageErr } = await supabase.storage.from(BUCKET).remove([filePath]);
  if (storageErr) throw storageErr;

  revalidatePath("/coach/docs");
}
