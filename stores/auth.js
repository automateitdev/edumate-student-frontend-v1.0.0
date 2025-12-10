// auth.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { useRouter } from 'nuxt/app';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        accessToken: null, // Initialize accessToken as null initially
        refreshToken: null, // Initialize refreshToken as null initially
        accessTokenExpiry: null,
        invoiceData:[],
        authError: {
            emailOrMobile: null,
            password: null,
        },
        loading: false,
    }),
    getters: {
        isAuthenticated() {
            return !!this.accessToken;
        },
        getUser() {
            return this.user;
        },
    },
    actions: {
        async authorizedUser() {
            this.loading = false;
            try {
                const response = await axios.get('/api/payment-portal/auth-user');
                // console.log(response);
                const { user, authorization } = response.data.payload.data;

                return true;

            } catch (error) {
                // console.error('Login error:', error);
                this.loading = false;
                return false; // Return false if login fails
            }

        },
        async authenticateUser(credentials) {
            this.loading = true;
            try {
                // Send login request to obtain access token and refresh token
                const response = await axios.post('/api/payment-portal/student-login', credentials);
                const { student, authorization, error } = response.data.payload.data;
                // console.log(response);
                // Update store state with user data and tokens
                this.user = student;
                this.accessToken = authorization.access_token;
                this.refreshToken = authorization.refresh_token;
                this.accessTokenExpiry = Math.floor(Date.now() / 1000) + authorization.expires_in * 60;

                if (student?.id && Array.isArray(student.academic_year_list) && student.academic_year_list.length > 0) {
                    localStorage.setItem('student_id', student.id.toString());
                    localStorage.setItem('academic_year_id', student.academic_year_list[0].id.toString());
                    localStorage.setItem('institute_logo', student.institute_logo || '');
                    localStorage.setItem('institute_name', student.institute_name.toString() || '');
                    localStorage.setItem('department_name', student.department_name.toString() || '');
                    
                
                }

                return { loginSuccess: true, error: null };
            } catch (error) {
                console.log(error)
                if (error.response) {
                    const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
                    const formattedErrors = errors.map(err => `${err.message}`).join('\n');
                    this.loading = false
                    return { loginSuccess: false, error: formattedErrors };
                } else {
                    this.loading = false
                    return { loginSuccess: false, error: "An error occurred during login." };
                }
            } finally {
                this.loading = false;
            }
        },
        async authLogout() {
            // this.loading = true;
            const router = useRouter();
            try {
                await axios.post('/api/payment-portal/student-login');
                this.resetState();
            } catch (error) {
                this.resetState();
                console.error('Logout error:', error);
                return false; // Return false if logout fails
            }
        },
        async refreshAccessToken() {
            try {
                const response = await axios.post('api/payment-portal/refresh');
                const { authorization } = response.data.payload.data;
                // Update store state with new access token and its expiry time
                this.accessToken = authorization.access_token;
                this.accessTokenExpiry = Math.floor(Date.now() / 1000) + authorization.expires_in * 60;;
            } catch (error) {
                console.error('Error refreshing access token:', error);
                throw error; // Propagate error for handling in axios.js
            }
        },

        resetState() {
            this.user = null;
            this.accessToken = null;
            this.refreshToken = null;
            this.accessTokenExpiry = null;
            this.authError = {
                emailOrMobile: null,
                password: null,
            };
            this.loading = false;
        },
    },
    persist: true,
});