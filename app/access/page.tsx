"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseFile } from "../../lib/parse";

const ALLOWED_EXTENSIONS = ["xlsx", "xls", "xlsm", "xlsb", "csv", "ods"];
const ACCEPT_ATTR = ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",");

export default function AccessPage() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const validateAndSet = (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFile(null);
      setError(
        `unsupported file type. please upload one of: ${ALLOWED_EXTENSIONS.join(", ")}`
      );
      return;
    }
    setFile(f);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("please upload a file first");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const insights = await parseFile(file);
      if (insights.rowCount === 0) {
        setLoading(false);
        setError("file is empty or has no readable rows");
        return;
      }
      sessionStorage.setItem("denver:insights", JSON.stringify(insights));
      router.push("/dashboard");
    } catch (e) {
      setLoading(false);
      setError(
        `failed to parse file: ${e instanceof Error ? e.message : "unknown error"}`,
      );
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <div className="w-full max-w-3xl">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Upload your order return data
        </h1>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) validateAndSet(f);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 px-6 py-20 text-center transition-colors ${
            file
              ? "border-solid border-green-500 bg-green-50 dark:border-green-500 dark:bg-green-950/30"
              : dragging
                ? "border-dashed border-zinc-900 bg-zinc-100 dark:border-zinc-200 dark:bg-zinc-800"
                : "border-dashed border-zinc-300 bg-white hover:border-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
          }`}
        >
          {file ? (
            <>
              <svg
                className="h-10 w-10 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                File uploaded successfully
              </p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {file.name}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setError(null);
                }}
                className="mt-1 text-xs font-medium text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                remove or choose another file
              </button>
            </>
          ) : (
            <>
              <svg
                className="h-10 w-10 text-zinc-400 dark:text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 7.5m0 0L7.5 12M12 7.5v9"
                />
              </svg>
              <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                drop file here or click to browse
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                accepted: {ALLOWED_EXTENSIONS.join(", ")}
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={ACCEPT_ATTR}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) validateAndSet(f);
              e.target.value = "";
            }}
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-base font-medium text-background transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-[#ccc]"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              analyzing...
            </>
          ) : (
            "Analyze"
          )}
        </button>
      </div>
    </div>
  );
}
