/**
 * User setup utilities for EasyShifts
 * Handles user credential management and setup
 */

import { logDebug, logInfo, logError } from '../utils';

/**
 * Set up a test user for development/testing
 */
export const setupTestUser = () => {
    const testUser = {
        username: "manager",
        password: "password", // Store password for WebSocket auth
        isManager: true,
        userId: 1,
        email: "manager@test.com"
    };
    
    localStorage.setItem('easyshifts_user', JSON.stringify(testUser));
    logInfo('userSetup', 'Test user credentials set up', { username: testUser.username });
    
    return testUser;
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
    try {
        const savedUser = localStorage.getItem('easyshifts_user');
        if (!savedUser) {
            logDebug('userSetup', 'No saved user found');
            return null;
        }
        
        const userData = JSON.parse(savedUser);
        logDebug('userSetup', 'Retrieved user data', { 
            username: userData.username,
            hasPassword: !!userData.password,
            isManager: userData.isManager 
        });
        
        return userData;
    } catch (error) {
        logError('userSetup', 'Failed to parse user data', error);
        return null;
    }
};

/**
 * Update user credentials
 */
export const updateUserCredentials = (username, password, isManager = false) => {
    const userData = {
        username,
        password,
        isManager,
        userId: isManager ? 1 : 2,
        email: `${username}@test.com`
    };
    
    localStorage.setItem('easyshifts_user', JSON.stringify(userData));
    logInfo('userSetup', 'User credentials updated', { 
        username: userData.username,
        isManager: userData.isManager 
    });
    
    return userData;
};

/**
 * Clear user credentials
 */
export const clearUserCredentials = () => {
    localStorage.removeItem('easyshifts_user');
    logInfo('userSetup', 'User credentials cleared');
};

/**
 * Ensure user has valid credentials for WebSocket auth
 */
export const ensureValidCredentials = () => {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        logInfo('userSetup', 'No user found, setting up test user');
        return setupTestUser();
    }
    
    if (!currentUser.password) {
        logInfo('userSetup', 'User missing password, updating with default');
        return updateUserCredentials(
            currentUser.username, 
            'password', 
            currentUser.isManager
        );
    }
    
    logDebug('userSetup', 'User credentials are valid');
    return currentUser;
};
