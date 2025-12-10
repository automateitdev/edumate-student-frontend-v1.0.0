import { defineStore } from 'pinia'
import axios from 'axios';

export const useGeneralConfigStore = defineStore('generalConfigs', {
  state: () => ({
    student_attendance_type: null,
    hr_attendance_type: null,
    student_portal_profile_edit: null,
    student_online_payment_setting: null,
    fees_payment_by_web: null,
    online_admission_web: null,
    allow_duplicate_roll: null,
    backdated_fee_collection: null,
    send_reciept_link: null,
    real_time_present_sms: null,
    sms_type: null,
    collection_sms: null,
    loading: false,
    error: null,
  }),
  actions: {
    async getConfigs() {
      this.loading = true;
      try {
        const response = await axios.get('/api/payment-portal/general-config-index');
        const { institute_wise_config } = response.data.payload.data;

        // Reset existing config values
        Object.keys(this.$state).forEach((key) => {
          if (key !== 'loading' && key !== 'error') {
            this[key] = null;
          }
        });

        // Map each config by its short_name
        institute_wise_config.forEach(config => {
          const { short_name, value } = config;
          if (short_name in this.$state) {
            this[short_name] = value;
          }
        });

        console.log(this.fees_payment_by_web)
        this.loading = false;
      } catch (error) {
        this.error = error;
        this.loading = false;
      }
    }
  }
})
