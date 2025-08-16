import { useState } from "react";

export default function useAuth() {
    const [user, setUser] = useState<any>(null);
    function signInStub() { setUser({ name: "Vedant", id: "u1" }); }
    function signOut() { setUser(null); }
    return { user, signInStub, signOut };
}
