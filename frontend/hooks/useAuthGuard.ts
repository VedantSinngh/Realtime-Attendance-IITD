// hooks/useAuthGuard.ts
import { useEffect, useState } from 'react';
import { useAuth } from '../services/AuthContext';

export const useAuthGuard = ({ requiredRole }: { requiredRole: string }) => {
    const { user, role } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
        } else if (requiredRole && role !== requiredRole) {
            // redirect or handle unauthorized
        }
        setLoading(false);
    }, [user, role, requiredRole]);

    return { loading };
};
