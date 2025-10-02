import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import FaceRegistration from "../../components/FaceRegistration";

const DEFAULT_LOCATION = { latitude: 12.813728, longitude: 80.041606 };
const RADIUS_METERS = 150;

const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (val: number) => (val * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export default function PreVerification() {
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [geoAllowed, setGeoAllowed] = useState(false);
    const [isCheckingLocation, setIsCheckingLocation] = useState(false);
    const [targetLocation, setTargetLocation] = useState(DEFAULT_LOCATION);

    const verifyGeoFence = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setIsCheckingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const current = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                setUserLocation(current);

                const distance = getDistanceFromLatLonInMeters(
                    current.latitude, current.longitude,
                    targetLocation.latitude, targetLocation.longitude
                );

                const allowed = distance <= RADIUS_METERS;
                setGeoAllowed(allowed);
                setIsCheckingLocation(false);

                if (!allowed) {
                    alert(`You are ${Math.round(distance)}m away from the target location. Must be within ${RADIUS_METERS}m.`);
                }
            },
            (error) => {
                alert("Error getting location: " + error.message);
                setIsCheckingLocation(false);
                setGeoAllowed(false);
            },
            { enableHighAccuracy: true }
        );
    };

    useEffect(() => {
        verifyGeoFence();
    }, []);

    return (
        <div style={{ padding: 20 }}>
            <h1>Face Registration</h1>

            <button onClick={verifyGeoFence} disabled={isCheckingLocation}>
                {isCheckingLocation ? "Checking..." : "Check Location"}
            </button>

            {userLocation && (
                <p>
                    Your location: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                </p>
            )}

            {!geoAllowed && userLocation && (
                <p style={{ color: "red" }}>
                    ❌ You must be within {RADIUS_METERS}m of the target location to proceed.
                </p>
            )}

            {geoAllowed && (
                <div>
                    <p style={{ color: "green" }}>
                        ✅ You are within {RADIUS_METERS}m of the target location
                    </p>
                    <FaceRegistration onSuccess={() => router.push("/face-verification/post")} />
                </div>
            )}
        </div>
    );
}
