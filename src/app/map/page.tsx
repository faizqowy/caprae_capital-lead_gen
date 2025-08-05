
"use client";

import { Suspense } from 'react';
import { useSearchParams } from "next/navigation";
import { Loader2, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

function MapDisplay() {
    const searchParams = useSearchParams();
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const name = searchParams.get('name');
    const router = useRouter();

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!lat || !lng) {
        return (
            <div className="text-center text-red-500">
                <p>Latitude and longitude are required to display the map.</p>
            </div>
        );
    }
    
    if (!apiKey) {
         return (
            <div className="text-center text-red-500">
                <p>Google Maps API key is not configured.</p>
                <p>Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.</p>
            </div>
        );
    }

    const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}`;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-4xl shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <MapPin className="h-6 w-6 text-primary" />
                             <CardTitle>Location for: {name || "Lead"}</CardTitle>
                         </div>
                        <Button variant="outline" size="sm" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video w-full rounded-md overflow-hidden border">
                         <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            src={mapSrc}>
                        </iframe>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function MapPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <MapDisplay />
        </Suspense>
    )
}
