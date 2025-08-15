"use client";

import { useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleGenerate = async () => {
    if (!prompt) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    setError(null);
    setImageUrl("");

    const { data, error: functionError } = await supabase.functions.invoke('generate-image', {
      body: { prompt },
    });

    if (functionError) {
      setError(functionError.message);
      setLoading(false);
      return;
    }

    if (data.error) {
      setError(data.error);
    } else {
      // The function returns a base64 string, so we prepend the data URI scheme
      setImageUrl(`data:image/png;base64,${data.image}`);
    }

    setLoading(false);
  };

  return (
    <div className="grid grid-rows-[1fr_auto] items-center justify-items-center min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-1 items-center w-full max-w-2xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>AI Image Generator</CardTitle>
            <CardDescription>
              Enter a prompt to generate an image using AI. Your API key is kept secure on the server.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex w-full items-center space-x-2">
              <Input
                type="text"
                placeholder="e.g., A cute cat programming on a laptop"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
              />
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? "Generating..." : "Generate"}
              </Button>
            </div>
            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="aspect-square w-full rounded-md border border-dashed flex items-center justify-center">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt={prompt}
                  className="object-contain h-full w-full rounded-md"
                />
              ) : (
                <p className="text-muted-foreground text-sm">Image will appear here</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <MadeWithDyad />
    </div>
  );
}