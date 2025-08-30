import React, { useState, createContext, useContext, ReactNode } from 'react';

// Types
export interface Leave {
    id: string;
    appliedOn: string;
    forDate: string;
    type: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    teamName: string;
    subject: string;
    description: string;
}

interface LeaveContextType {
    leaves: Leave[];
    currentScreen: string;
    setCurrentScreen: (screen: string) => void;
    selectedLeave: Leave | null;
    setSelectedLeave: (leave: Leave | null) => void;
    addLeave: (newLeave: Omit<Leave, 'id' | 'appliedOn' | 'status'>) => void;
    updateLeave: (id: string, updatedData: Partial<Leave>) => void;
    deleteLeave: (id: string) => void;
    isVerificationModalVisible: boolean;
    setVerificationModalVisible: (visible: boolean) => void;
}

// Context
const LeaveContext = createContext < LeaveContextType | undefined > (undefined);

// Provider
export const LeaveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [leaves, setLeaves] = useState < Leave[] > ([
        {
            id: 'L1',
            appliedOn: '2025-07-01',
            forDate: '2025-07-05',
            type: 'Casual',
            status: 'Pending',
            teamName: 'Development',
            subject: 'Personal Work',
            description: 'Need to attend to personal matters'
        },
        {
            id: 'L2',
            appliedOn: '2025-06-15',
            forDate: '2025-06-20',
            type: 'Sick',
            status: 'Approved',
            teamName: 'Development',
            subject: 'Medical Checkup',
            description: 'Annual health checkup appointment'
        }
    ]);

    const [currentScreen, setCurrentScreen] = useState('profile');
    const [selectedLeave, setSelectedLeave] = useState < Leave | null > (null);
    const [isVerificationModalVisible, setVerificationModalVisible] = useState(false);

    const addLeave = (newLeave: Omit<Leave, 'id' | 'appliedOn' | 'status'>) => {
        const leave: Leave = {
            ...newLeave,
            id: `L${Date.now()}`,
            appliedOn: new Date().toISOString().split('T')[0],
            status: 'Pending'
        };
        setLeaves(prev => [...prev, leave]);
    };

    const updateLeave = (id: string, updatedData: Partial<Leave>) => {
        setLeaves(prev => prev.map(leave =>
            leave.id === id ? { ...leave, ...updatedData } : leave
        ));
    };

    const deleteLeave = (id: string) => {
        setLeaves(prev => prev.filter(leave => leave.id !== id));
    };

    return (
        <LeaveContext.Provider value={{
            leaves,
            currentScreen,
            setCurrentScreen,
            selectedLeave,
            setSelectedLeave,
            addLeave,
            updateLeave,
            deleteLeave,
            isVerificationModalVisible,
            setVerificationModalVisible
        }}>
            {children}
        </LeaveContext.Provider>
    );
};

// Hook
export const useLeaveContext = () => {
    const context = useContext(LeaveContext);
    if (!context) {
        throw new Error('useLeaveContext must be used within a LeaveProvider');
    }
    return context;
};