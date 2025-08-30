import { useEffect } from 'react';
import { useAuth } from '../services/AuthContext';
import { router } from 'expo-router';

interface UseAuthGuardOptions {
    requiredRole?: 'admin' | 'user';
    redirectTo?: string;
    allowUnauthenticated?: boolean;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
    const {
        requiredRole,
        redirectTo = '/onboarding/signin',
        allowUnauthenticated = false
    } = options;

    const { user, role, loading, initialized } = useAuth();

    useEffect(() => {
        // Don't redirect while still loading or not initialized
        if (loading || !initialized) {
            return;
        }

        // Check if user is authenticated when required
        if (!allowUnauthenticated && !user) {
            console.log('User not authenticated, redirecting to:', redirectTo);
            router.replace(redirectTo);
            return;
        }

        // Check role-based access
        if (requiredRole && role !== requiredRole) {
            console.log(`Access denied. Required: ${requiredRole}, Current: ${role}`);

            if (role === 'admin') {
                router.replace('/admin');
            } else if (role === 'user') {
                router.replace('/home');
            } else {
                router.replace('/onboarding/signin');
            }
            return;
        }
    }, [user, role, loading, initialized, requiredRole, redirectTo, allowUnauthenticated]);

    return {
        user,
        role,
        loading,
        initialized,
        isAuthenticated: !!user,
        hasRequiredRole: requiredRole ? role === requiredRole : true,
    };
}

// Example usage in components:
/*
// For admin-only pages
export default function AdminPage() {
  const { loading, hasRequiredRole } = useAuthGuard({ requiredRole: 'admin' });
  
  if (loading || !hasRequiredRole) {
    return <LoadingScreen />;
  }
  
  return <AdminDashboard />;
}

// For user-only pages
export default function UserPage() {
  const { loading, isAuthenticated } = useAuthGuard({ requiredRole: 'user' });
  
  if (loading || !isAuthenticated) {
    return <LoadingScreen />;
  }
  
  return <UserDashboard />;
}

// For public pages (no auth required)
export default function PublicPage() {
  const { user } = useAuthGuard({ allowUnauthenticated: true });
  
  return (
    <View>
      {user ? <AuthenticatedView /> : <PublicView />}
    </View>
  );
}
*/