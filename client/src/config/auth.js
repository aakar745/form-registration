export const DEFAULT_ADMIN = {
    email: 'admin@admin.com',
    password: 'admin123',
    name: 'Admin',
    role: 'admin'
};

export const isAuthenticated = () => {
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');
    return token && user;
};

export const getUser = () => {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const getToken = () => {
    return sessionStorage.getItem('token');
};
