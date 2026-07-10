import { useRef, useState } from "react";
import { Camera, Loader2, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Props = {
  userId: string | null;
  avatarUrl: string | null;
  onChange: (url: string) => void;
};

/**
 * Compact avatar with an inline device-photo upload flow. Files are stored
 * in the private `avatars` bucket under `{user_id}/…` and rendered via a
 * fresh signed URL that we hand back to the parent to persist on `profiles`.
 */
export default function AvatarPicker({ userId, avatarUrl, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function pickFile(file: File) {
    if (!userId) {
      toast.error("Sign in to upload a photo.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (sErr || !signed) throw sErr ?? new Error("signed url");
      setPreview(signed.signedUrl);
      onChange(signed.signedUrl);
      toast.success("Photo updated");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="group relative grid h-16 w-16 place-items-center overflow-hidden rounded-full border-2 border-crimson bg-noir shadow-crimson"
        aria-label="Change photo"
      >
        {preview ? (
          <img src={preview} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <UserIcon className="h-7 w-7 text-crimson" />
        )}
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/70 py-0.5 opacity-0 transition group-hover:opacity-100">
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin text-white" />
          ) : (
            <Camera className="h-3 w-3 text-white" />
          )}
        </span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) pickFile(f);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
}